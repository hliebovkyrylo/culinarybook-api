import {
  ICreateRecipeSchema,
  ICreateVisitedRedcipe,
  IUpdateRecipeSchema
}                              from "../schemas/recipe.schema";
import { prisma }              from "..";
import { likeService }         from "./like.service";
import { saveService }         from "./save.service";
import { stepService }         from "./step.service";
import { commentService }      from "./comment.service";
import { notificationService } from "./notification.service";

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
    await prisma.like.deleteMany({ where: { recipeId: recipeId } });
    await prisma.saved.deleteMany({ where: { recipeId: recipeId } });
    await commentService.deleteCommentRepliesByRecipeId(recipeId);
    await prisma.step.deleteMany({ where: { recipeId: recipeId } });
    await prisma.comment.deleteMany({ where: { recipeId: recipeId } });
    await prisma.notification.deleteMany({ where: { recipeId: recipeId } });    
    await prisma.visited.deleteMany({ where: { recipeId: recipeId } });
  
    return await prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });
  }  

  public async getLikedRecipesByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const liked = await prisma.like.findMany({
      skip,
      where: {
        userId: userId,
      },
      select: {
        recipeId: true,
      },
      take: limit,
    });

    const recipeIds = liked.map(id => id.recipeId);

    return await prisma.recipe.findMany({
      where: {
        id: {
          in: recipeIds,
        },
      },
      include: {
        owner: true
      }
    });
  };

  public async getAllLikedRecipesByUserId(userId: string) {
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

  public async getAllRecipes() {
    return await prisma.recipe.findMany({
      where: {
        isPublic: true,
      },
      include: {
        owner: true
      }
    });
  };

  public async getMyRecipesByUserId(userId: string, sortBy: 'asc' | 'desc', page: number, limit: number) {
    const skip = (page - 1) * limit;

    return await prisma.recipe.findMany({
      skip,
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: sortBy
      },
      take: limit,
      include: {
        owner: true
      }
    });
  };

  public async getRecipesByUserId(userId: string) {
    return await prisma.recipe.findMany({
      where: {
        ownerId : userId,
        isPublic: true,
      },
      include: {
        owner: true
      },
    });
  };

  public async getRecipesByUserIdWithSort(userId: string, sortBy: 'asc' | 'desc') {
    return await prisma.recipe.findMany({
      where: {
        ownerId : userId,
        isPublic: true,
      },
      include: {
        owner: true
      },
      orderBy: {
        createdAt: sortBy
      }
    });
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

  public async getRecipeVisitsByRecipeId(recipeId: string) {
    return await prisma.visited.findMany({
      where: {
        recipeId: recipeId,
      },
    });
  };

  public async getVisitedRecipesByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const visited = await prisma.visited.findMany({
      skip,
      where: {
        userId: userId,
      },
      take: limit,
    });

    return await prisma.recipe.findMany({
      where: {
        id: {
          in: visited.map(visit => visit.recipeId),
        },
      },
      include: {
        owner: true
      }
    });
  };

  public async getAllVisitedRecipesByUserId(userId: string) {
    const visited = await prisma.visited.findMany({
      where: {
        userId: userId,
      },
    });

    return await prisma.recipe.findMany({
      where: {
        id: {
          in: visited.map(visit => visit.recipeId),
        },
      },
    });
  };

  public async getRecipesByIds(recipeIds: string[]) {
    return await prisma.recipe.findMany({
      where: {
        id: {
          in: recipeIds
        }
      },
    });
  };

  public async getSavedRecipesByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const saved = await prisma.saved.findMany({
      skip,
      where: {
        userId: userId,
      },
      select: {
        recipeId: true,
      },
      take: limit
    });

    const recipesIds = saved.map(save => save.recipeId);

    return await prisma.recipe.findMany({
      where: {
        id: {
          in: recipesIds,
        },
      },
      include: {
        owner: true
      }
    });
  };

  public async getAllSavedRecipesByUserId(userId: string) {
    const saved = await prisma.saved.findMany({
      where: {
        userId: userId,
      },
      select: {
        recipeId: true,
      },
    });

    const recipesIds = saved.map(save => save.recipeId);

    return await prisma.recipe.findMany({
      where: {
        id: {
          in: recipesIds,
        },
      },
    });
  };

  public async findRecipesByTitle(recipeTitle: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return await prisma.recipe.findMany({
      skip,
      where: {
        title: {
          contains: recipeTitle,
          mode    : "insensitive",
        },
        isPublic: true,
      },
      take: limit,
      include: {
        owner: true
      }
    });
  };
};

export const recipeService = new RecipeService();