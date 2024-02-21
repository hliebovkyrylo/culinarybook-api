import { prisma }              from "..";
import { ICreateRecipeSchema } from "../schemas/recipe.schema";

class RecipeService {
  public async createRecipe(data: Omit<ICreateRecipeSchema, "id">) {
    return await prisma.recipe.create({ data });
  };
};

export const recipeService = new RecipeService();