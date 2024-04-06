import { ILikeSchema } from "../../schemas/like.schema";
import { prisma }      from "../..";

class LikeService {
  public async createlike(data: Omit<ILikeSchema, "id">) {
    return await prisma.like.create({ data });
  };

  public async getLikeByIds(data: Omit<ILikeSchema, "id">) {
    return await prisma.like.findFirst({
      where: {
        userId  : data.userId,
        recipeId: data.recipeId,
      },
    });
  };

  public async getLikeById(likeId: string) {
    return await prisma.like.findFirst({
      where: {
        id: likeId,
      },
    });
  };

  public async removeLike(data: Omit<ILikeSchema, "id">) {
    const like = await prisma.like.findFirst({
      where: {
        userId  : data.userId,
        recipeId: data.recipeId,
      },
    });
    
    return await prisma.like.delete({
      where: {
        id: like?.id,
      },
    });
  };

  public async getLikesByRecipeId(recipeId: string) {
    return await prisma.like.findMany({
      where: {
        recipeId: recipeId,
      },
    });
  };

  public async getLikesByRecipseIds(recipeId: string[]) {
    return await prisma.like.findMany({
      where: {
        recipeId: {
          in: recipeId
        },
      },
    });
  };

  public async deleteLikes(likeId: string[]) {
    return await prisma.like.deleteMany({
      where: {
        id: {
          in: likeId,
        },
      },
    });
  };
};

export const likeService = new LikeService();