import { Recipe, User } from "@prisma/client";
import { type Request, type Response } from "express";
import { recipeService } from "../services/recipe.service";
import {
  ICreateRecipeSchema,
  ICreateStepSchema,
  IUpdateRecipeSchema,
  IUpdateStepSchema
} from "../schemas/recipe.schema";
import { RecipePreviewDTO } from "../dtos/recipe.dto";
import { verifyToken } from "../utils/token";
import { stepService } from "../services/step.service";
import { likeService } from "../services/like.service";
import { commentService } from "../services/comment.service";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3 } from "../configs/aws.config";

class RecipeController {
  public async create(request: Request, response: Response) {
    const user = request.user as User;
    const data = request.body as ICreateRecipeSchema;
    const recipe = await recipeService.createRecipe({ ...data, ownerId: user.id });

    response.send(recipe);
  };

  public async getRecipe(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    const recipe = await recipeService.getRecipeById(recipeId);
    const accessToken = request.headers.authorization;

    if (recipe === null) {
      return response.status(404).send({
        code: "recipe-not-found",
        message: "Recipe not found!"
      });
    }

    if (accessToken) {
      const userId = verifyToken(accessToken);
      const isAlreadyVisited = await recipeService.getVisitedRecipeByIds(recipe.id, userId);

      if (isAlreadyVisited === null) {
        await recipeService.createVisitedRecipe({ userId: userId, recipeId: recipe.id });
      }
    }

    response.send(recipe);
  };

  public async update(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    const data = request.body as IUpdateRecipeSchema;

    const recipe = await recipeService.getRecipeById(recipeId);

    if (!recipe) {
      return response.status(404).send({
        code: "recipe-not-found",
        message: "Recipe not found!"
      })
    }

    if (data.image !== '') {
      const objectsToDelete = [];

      if (data.image !== '' && recipe.image !== '') {
        objectsToDelete.push({ Key: (recipe.image).split("/").pop() });
      }

      if (objectsToDelete.length > 0) {
        const params = {
          Bucket: 'culinarybook-images',
          Delete: {
            Objects: objectsToDelete
          }
        };

        const command = new DeleteObjectsCommand(params);
        await s3.send(command);
      }
    }

    const updatedRecipe = await recipeService.updateRecipe(recipeId, data);

    response.send(updatedRecipe);
  };

  public async delete(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;

    const recipe = await recipeService.getRecipeById(recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code: "recipe-not-found",
        message: "Recipe not found!",
      });
    }

    if (recipe.image !== '') {
      const objectsToDelete = [];

      objectsToDelete.push({ Key: (recipe.image).split("/").pop() });

      if (objectsToDelete.length > 0) {
        const params = {
          Bucket: 'culinarybook-images',
          Delete: {
            Objects: objectsToDelete
          }
        };

        const command = new DeleteObjectsCommand(params);
        await s3.send(command);
      }

      await recipeService.deleteRecipe(recipeId);

      response.send({ message: "Recipe deleted!" });
    };
  }

  public async getMyRecipes(request: Request, response: Response) {
    const user = request.user as User;
    const sortBy = request.query.sortBy as 'asc' | 'desc';
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 10;

    const recipes = await recipeService.getMyRecipesByUserId(user.id, sortBy, page, limit);

    const recipesDTO = recipes.map(recipe => new RecipePreviewDTO(recipe));
    response.send(recipesDTO);
  };

  public async getLikedRecipes(request: Request, response: Response) {
    const user = request.user as User;
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 10;

    const recipes = await recipeService.getLikedRecipesByUserId(user.id, page, limit);

    response.send(recipes.map(recipe => new RecipePreviewDTO(recipe)));
  };

  public async getRecommendedRecipes(request: Request, response: Response): Promise<void> {
    const user = request.user as User;
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 10;
    const recipeName = request.query.title as string;

    const [likedRecipes, savedRecipes, visitedRecipes] = await Promise.all([
      recipeService.getAllLikedRecipesByUserId(user.id),
      recipeService.getAllSavedRecipesByUserId(user.id),
      recipeService.getAllVisitedRecipesByUserId(user.id)
    ]);

    const recipes = [...likedRecipes, ...savedRecipes, ...visitedRecipes];

    let keywords: string[] = [];

    let recipeWords = recipes.map(recipe => {
      return new Set(recipe.title.split(' '));
    });

    if (recipeWords.length > 0) {
      keywords = [...recipeWords[0]].filter(word => {
        return recipeWords.every(set => set.has(word));
      });
    }

    function containsWord(recipe: Recipe) {
      for (let word of keywords) {
        if (recipe.title.includes(word)) {
          return true;
        }
      };
      return false;
    };

    const recipesIds = recipes.map(recipe => recipe.id);

    const [likes, views, comments, findedRecipes] = await Promise.all([
      likeService.getLikesByRecipeIds(recipesIds),
      recipeService.getRecipeVisitsByRecipeIds(recipesIds),
      commentService.getCommentsByRecipeIds(recipesIds),
      recipeService.getAllRecipes(recipeName !== 'undefined' ? recipeName : undefined)
    ]);

    findedRecipes.filter(recipe => recipe.ownerId !== user.id);

    function calculateScore(recipeId: string) {
      const likesCount = likes.filter(like => like.recipeId === recipeId).length;
      const viewsCount = views.filter(view => view.recipeId === recipeId).length;
      const commentsCount = comments.filter(comment => comment.recipeId === recipeId).length;

      return 1 * commentsCount + 2 * viewsCount + 3 * likesCount;
    };

    findedRecipes.sort((a, b) => {
      const aScore = calculateScore(a.id);
      const bScore = calculateScore(b.id);
      const aContainsWord = containsWord(a);
      const bContainsWord = containsWord(b);

      if (aContainsWord && !bContainsWord) return -1;
      if (!aContainsWord && bContainsWord) return 1;
      return bScore - aScore;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRecipes = findedRecipes.slice(startIndex, endIndex);

    response.send(paginatedRecipes.map(recipe => new RecipePreviewDTO(recipe)));
  };

  public async getVisitedRecipes(request: Request, response: Response) {
    const user = request.user as User;
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 10;

    const visitedRecipes = await recipeService.getVisitedRecipesByUserId(user.id, page, limit);

    response.send(visitedRecipes.map(recipe => new RecipePreviewDTO(recipe)));
  };

  public async createSteps(request: Request, response: Response) {
    const data = request.body as Omit<ICreateStepSchema, "recipeId">[];
    const recipeId = request.params.recipeId as string;
    const steps = await stepService.createStep(data.map(step => ({ ...step, recipeId })));

    response.send(steps);
  };

  public async getSteps(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    const steps = await stepService.getStepsByRecipeId(recipeId);

    response.send(steps);
  };

  public async updateSteps(request: Request, response: Response) {
    const user = request.user as User;
    const data = request.body as IUpdateStepSchema[];

    const stepIds = data.map(step => step.stepId);
    const step = await stepService.getStepsByIds(stepIds);
    const stepRecipesIds = step.map(step => step.recipeId);

    const recipes = await recipeService.getRecipesByIds(stepRecipesIds);

    if (step === null) {
      return response.status(404).send({
        code: "step-not-found",
        message: "Step not found!",
      });
    }

    if (!recipes.map(recipe => recipe.ownerId.toString()).includes(user.id.toString())) {
      return response.status(403).send({
        code: "have-no-access",
        message: "You have no access to change it!",
      });
    }

    const updatedSteps = await stepService.updateStepsByIds(data);

    response.send(updatedSteps);
  };

  public async deleteStep(request: Request, response: Response) {
    const user = request.user as User;
    const stepId = request.params.stepId as string;

    const step = await stepService.getStepById(stepId);

    if (step === null) {
      return response.status(404).send({
        code: "step-not-found",
        message: "Step not found!"
      });
    }

    const recipe = await recipeService.getRecipeById(step.recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code: "recipe-not-found",
        message: "Recipe not found!"
      })
    }

    if (user.id.toString() !== recipe.ownerId.toString()) {
      return response.status(403).send({
        code: "have-no-access",
        message: "You have no access to change it!",
      });
    }

    await stepService.deleteStepById(stepId);

    response.send({ message: "Step deleted!" })
  };

  public async getSavedRecipes(request: Request, response: Response) {
    const user = request.user as User;
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 10;

    const savedRecipes = await recipeService.getSavedRecipesByUserId(user.id, page, limit);

    response.send(savedRecipes.map(recipe => new RecipePreviewDTO(recipe)));
  };

  public async getPopularRecipes(request: Request, response: Response): Promise<void> {
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 10;
    const recipeName = request.query.title as string;

    const recipes = await recipeService.getAllRecipes(recipeName !== 'undefined' ? recipeName : undefined);

    const recipesIds = recipes.map(recipe => recipe.id);

    const [likes, views, comments] = await Promise.all([
      likeService.getLikesByRecipeIds(recipesIds),
      recipeService.getRecipeVisitsByRecipeIds(recipesIds),
      commentService.getCommentsByRecipeIds(recipesIds)
    ]);

    function calculateScore(recipeId: string): number {
      const likesCount = likes.filter(like => like.recipeId === recipeId).length;
      const viewsCount = views.filter(view => view.recipeId === recipeId).length;
      const commentsCount = comments.filter(comment => comment.recipeId === recipeId).length;

      return 1 * commentsCount + 2 * viewsCount + 3 * likesCount;
    };

    recipes.sort((a: Recipe, b: Recipe) => calculateScore(b.id) - calculateScore(a.id));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRecipes = recipes.slice(startIndex, endIndex);

    response.send(paginatedRecipes.map(recipe => new RecipePreviewDTO(recipe)));
  };

  public async getUserRecipes(request: Request, response: Response) {
    const userId = request.params.userId;
    const sortBy = request.query.sortBy as 'asc' | 'desc';
    const recipes = await recipeService.getRecipesByUserIdWithSort(userId, sortBy);

    const recipesDTO = recipes.map(recipe => new RecipePreviewDTO(recipe));
    response.send(recipesDTO);
  };
};

export const recipeController = new RecipeController();
