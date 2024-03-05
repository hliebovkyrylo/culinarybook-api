import { Recipe, User }                 from "@prisma/client";
import { type Request, type Response  } from "express";
import { recipeService }                from "../services/recipe.service";
import { 
  ICreateRecipeSchema, 
  ICreateStepSchema, 
  IUpdateRecipeSchema, 
  IUpdateStepSchema
}                                       from "../schemas/recipe.schema";
import { RecipePreviewDTO }             from "../dtos/recipe.dto";
import { verifyToken }                  from "../utils/token";
import { stepService }                  from "../services/step.service";
import { likeService } from "../services/like.service";
import { commentService } from "../services/comment.service";

class RecipeController {
  public async create(request: Request, response: Response) {
    const user   = request.user as User;
    const data   = request.body as ICreateRecipeSchema;
    const recipe = await recipeService.createRecipe({ ...data, ownerId: user.id });

    response.send(recipe);
  };

  public async getRecipe(request: Request, response: Response) {
    const recipeId    = request.params.recipeId as string;
    const recipe      = await recipeService.getRecipeById(recipeId);
    const accessToken = request.headers.authorization;

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!"
      });
    }

    if (accessToken) {
      const userId           = verifyToken(accessToken);
      const isAlreadyVisited = await recipeService.getVisitedRecipeByIds(recipe.id, userId);

      if (isAlreadyVisited === null) {
        await recipeService.createVisitedRecipe({ userId: userId, recipeId: recipe.id });
      }
    }

    response.send(recipe);
  };

  public async update(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    const data     = request.body as IUpdateRecipeSchema;

    const updatedRecipe = await recipeService.updateRecipe(recipeId, data);

    response.send(updatedRecipe);
  };

  public async delete(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    await recipeService.deleteRecipe(recipeId);

    response.send("Recipe deleted!");
  };

  public async getLikedRecipes(request: Request, response: Response) {
    const user    = request.user as User;
    const recipes = await recipeService.getLikedRecipesByUserId(user.id);

    response.send(recipes.map(recipe => new RecipePreviewDTO(recipe)));
  };

  public async getRecommendedRecipes(request: Request, response: Response) {
    const user = request.user as User;

    const likedRecipes   = await recipeService.getLikedRecipesByUserId(user.id);
    const savedRecipes   = await recipeService.getSavedRecipesByUserId(user.id);
    const visitedRecipes = await recipeService.getVisitedRecipesByUserId(user.id);

    const recipes = likedRecipes.concat(savedRecipes, visitedRecipes);

    let keywords: string[] = [];

    let recipeWords = recipes.map(recipe => {
      return new Set(recipe.title.split(' '));
    });
    
    keywords = [...recipeWords[0]].filter(word => {
      return recipeWords.every(set => set.has(word));
    });

    const findedRecipes = (await recipeService.getAllRecipes()).filter(recipe => recipe.ownerId !== user.id);

    function containsWord(recipe: Recipe) {
      for (let word of keywords) {
        if (recipe.title.includes(word)) {
          return true;
        }
      };
    };

    const recipesIds = recipes.map(recipe => recipe.id);

    const likes = await Promise.all(recipesIds.map(recipeId => {
      return likeService.getLikesByRecipeId(recipeId);
    }));

    const views = await Promise.all(recipesIds.map(recipeId => {
      return recipeService.getRecipeVisitsByRecipeId(recipeId);
    }));

    const comments = await Promise.all(recipesIds.map(recipeId => {
      return commentService.getCommentsByRecipeId(recipeId);
    }));

    function calculateScore(recipeId: string) {
      const likesCount    = likes.flat().filter(like => like.recipeId === recipeId).length;
      const viewsCount    = views.flat().filter(view => view.recipeId === recipeId).length;
      const commentsCount = comments.flat().filter(comment => comment.recipeId === recipeId).length;
    
      return 1 * commentsCount + 2 * viewsCount + 3 * likesCount;
    };

    findedRecipes.sort((a, b) => {
      let aContainsWord = containsWord(a);
      let bContainsWord = containsWord(b);

      if (aContainsWord && !bContainsWord) {
        return -1;
      } else if (!aContainsWord && bContainsWord) {
        return 1;
      } else {
        return calculateScore(b.id) - calculateScore(a.id);
      }
    })

    response.send(findedRecipes.map(recipe => new RecipePreviewDTO(recipe)));
  };

  public async getVisitedRecipes(request: Request, response: Response) {
    const user           = request.user as User;
    const visitedRecipes = await recipeService.getVisitedRecipesByUserId(user.id);

    response.send(visitedRecipes);
  };

  public async createSteps(request: Request, response: Response) {
    const data     = request.body as Omit<ICreateStepSchema, "recipeId">[];
    const recipeId = request.params.recipeId as string;
    const steps    = await stepService.createStep(data.map(step => ({ ...step, recipeId })));

    response.send(steps);
  };

  public async getSteps(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    const steps    = await stepService.getStepsByRecipeId(recipeId);

    response.send(steps);
  };

  public async updateSteps(request: Request, response: Response) {
    const user = request.user as User;
    const data = request.body as IUpdateStepSchema[];

    const stepIds        = data.map(step => step.stepId);
    const step           = await stepService.getStepsByIds(stepIds);
    const stepRecipesIds = step.map(step => step.recipeId);

    const recipes = await recipeService.getRecipesByIds(stepRecipesIds);

    if (step === null) {
      return response.status(404).send({
        code   : "step-not-found",
        message: "Step not found!",
      });
    }

    if (!recipes.map(recipe => recipe.ownerId.toString()).includes(user.id.toString())) {
      return response.status(403).send({
        code   : "have-no-access",
        message: "You have no access to change it!",
      });
    }

    const updatedSteps = await stepService.updateStepsByIds(data);

    response.send(updatedSteps);
  };

  public async deleteStep(request: Request, response: Response) {
    const user   = request.user as User;
    const stepId = request.params.stepId as string;

    const step = await stepService.getStepById(stepId);

    if (step === null) {
      return response.status(404).send({
        code   : "step-not-found",
        message: "Step not found!"
      });
    }

    const recipe = await recipeService.getRecipeById(step.recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!"
      })
    }

    if (user.id.toString() !== recipe.ownerId.toString()) {
      return response.status(403).send({
        code   : "have-no-access",
        message: "You have no access to change it!",
      });
    }

    await stepService.deleteStepById(stepId);

    response.send("Step deleted!")
  };

  public async getSavedRecipes(request: Request, response: Response) {
    const user         = request.user as User;
    const savedRecipes = await recipeService.getSavedRecipesByUserId(user.id);

    response.send(savedRecipes.map(recipe => new RecipePreviewDTO(recipe)));
  };
};

export const recipeController = new RecipeController();