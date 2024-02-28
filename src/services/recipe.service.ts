import {
  ICreateRecipeSchema,
  ICreateVisitedRedcipe,
  IUpdateRecipeSchema
}                         from "../schemas/recipe.schema";
import { prisma }         from "..";

class RecipeService {
  public async createRecipe(data: Omit<ICreateRecipeSchema, "id">) {
    return await prisma.recipe.create({ data });
  };

  public async getRecipeById(recipeId: string) {
    return await prisma.recipe.findFirst({
      where: {
        id: recipeId,
      },
    });
  };

  public async updateRecipe(recipeId: string, data: IUpdateRecipeSchema) {
    return await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: data,
    });
  };

  public async deleteRecipe(recipeId: string) {
    return await prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });
  };

  public async getLikedRecipesByUserId(userId: string) {
    const liked = await prisma.like.findMany({
      where: {
        userId: userId,
      },
      select: {
        recipeId: true,
      },
    });

    const recipeIds = liked.map(id => id.recipeId);

    return await prisma.recipe.findMany({
      where: {
        id: {
          in: recipeIds,
        },
      },
    });
  };

  public async getRecommendedRecipesByKeyword(keyword: string) {
    return await prisma.recipe.findMany({
      where: {
        title: {
          contains: keyword,
        },
      },
      take: 16,
    });
  };

  public async getPopularRecipes() {
    const recipes = await prisma.recipe.findMany();

    return await Promise.all(recipes.map(async (recipe) => {
      const likesCount = await prisma.like.count({
        where: {
          recipeId: recipe.id,
        },
      });

      return { ...recipe, likesCount };
    }));
  };

  public async createVisitedRecipe(data: Omit<ICreateVisitedRedcipe, "id">) {
    return await prisma.visited.create({ data });
  };

  public async getVisitedRecipeByIds(recipeId: string, userId: string) {
    return await prisma.visited.findFirst({
      where: {
        userId: userId,
        recipeId: recipeId,
      },
    });
  }; 
};

export const recipeService = new RecipeService();