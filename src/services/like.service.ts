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

  public async getUniqueLike(data: ILikeSchema) {
    return await prisma.like.findFirst({
      where: {
        userId  : data.userId,
        recipeId: data.recipeId,
      },
    });
  };
};

export const likeService = new LikeService();