import { User }                         from "@prisma/client";
import { type Request, type Response  } from "express";
import { recipeService }                from "../services/recipe.service";
import { ICreateRecipeSchema, IUpdateRecipeSchema }          from "../schemas/recipe.schema";

class RecipeController {
  public async create(request: Request, response: Response) {
    const user   = request.user as User;
    const data   = request.body as ICreateRecipeSchema;
    const recipe = await recipeService.createRecipe({ ...data, ownerId: user.id });

    response.send(recipe);
  };

  public async getRecipe(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    const recipe   = await recipeService.getRecipeById(recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!"
      });
    }

    response.send(recipe);
  };

  public async update(request: Request, response: Response) {
    const user     = request.user as User;
    const recipeId = request.params.recipeId as string;
    const data     = request.body as IUpdateRecipeSchema;

    const recipe = await recipeService.getRecipeById(recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!",
      });
    }

    if (user.id.toString() !== recipe.ownerId.toString()) {
      return response.status(403).send({
        code   : "fordbidden",
        message: "You have no access to change this recipe!",
      });
    }

    const updatedRecipe = await recipeService.updateRecipe(recipeId, data);

    response.send(updatedRecipe);
  };
};

export const recipeController = new RecipeController();