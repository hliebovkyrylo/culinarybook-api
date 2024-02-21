import { User }                         from "@prisma/client";
import { type Request, type Response  } from "express";
import { recipeService }                from "../services/recipe.service";
import { ICreateRecipeSchema }          from "../schemas/recipe.schema";

class RecipeController {
  public async create(request: Request, response: Response) {
    const user   = request.user as User;
    const data   = request.body as ICreateRecipeSchema;
    const recipe = await recipeService.createRecipe({ ...data, ownerId: user.id });

    response.send(recipe);
  };
};

export const recipeController = new RecipeController();