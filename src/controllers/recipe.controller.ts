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
import natural                          from "natural";
import { verifyToken }                  from "../utils/token";
import { stepService }                  from "../services/step.service";

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
    const user         = request.user as User;
    const likedRecipes = await recipeService.getLikedRecipesByUserId(user.id);

    if (!user) {
      const recipesWithLikes = await recipeService.getPopularRecipes();

      const sortedRecipes = recipesWithLikes.sort((a, b) => {
        const likesDiff = b.likesCount - a.likesCount;

        return likesDiff;
      });

      response.send(sortedRecipes);
    }

    const tokenizer = new natural.WordTokenizer();
    let keywords: string[] = [];

    likedRecipes.forEach(recipe => {
      const words = tokenizer.tokenize(recipe.title);
      if (words) {
        keywords = [...keywords, ...words];
      }
    });

    let recommendedRecipes: Recipe[] = [];

    for (let keyword of keywords) {
      const recipes = await recipeService.getRecommendedRecipesByKeyword(keyword);

      recommendedRecipes = [...recommendedRecipes, ...recipes];
    };

    recommendedRecipes = recommendedRecipes.filter((recipe, index, self) => 
      index === self.findIndex((r) => r.id === recipe.id)
    );

    response.send(recommendedRecipes.map(recommendedRecipe => new RecipePreviewDTO(recommendedRecipe)));
  };

  public async getVisitedRecipes(request: Request, response: Response) {
    const user           = request.user as User;
    const visitedRecipes = await recipeService.getVisitedRecipes(user.id);

    const recipeIds = visitedRecipes.map(recipe => recipe.recipeId);
    const recipes   = await recipeService.getRecipesByIds(recipeIds);

    response.send(recipes.map(recipe => new RecipePreviewDTO(recipe)));
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
};

export const recipeController = new RecipeController();