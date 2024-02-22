import { ILikeSchema } from "../schemas/like.schema";
import { prisma }            from "..";

class LikeService {
  public async createlike(data: Omit<ILikeSchema, "id">) {
    return await prisma.like.create({ data });
  };

  public async getLikeByRecipeId(recipeId: string) {
    return await prisma.like.findFirst({
      where: {
        recipeId: recipeId,
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

  public async getUniqueLike(data: ILikeSchema) {
    return await prisma.like.findFirst({
      where: {
        userId  : data.userId,
        recipeId: data.recipeId,
      },
    });
  };

  public async removeLike(likeId: string) {
    return await prisma.like.delete({
      where: {
        id: likeId,
      },
    });
  };
};

export const likeService = new LikeService();