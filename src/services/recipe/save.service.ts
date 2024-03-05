import { prisma }      from "../..";
import { ILikeSchema } from "../../schemas/like.schema";

class SaveService {
  public async createSave(data: Omit<ILikeSchema, "id">) {
    return await prisma.saved.create({ data });
  };

  public async removeSave(data: Omit<ILikeSchema, "id">) {
    const saved = await prisma.saved.findFirst({
      where: {
        userId  : data.userId,
        recipeId: data.recipeId,
      },
    });

    return await prisma.saved.delete({
      where: {
        id: saved?.id,
      },
    });
  };

  public async getSavedByIds(data: Omit<ILikeSchema, "id">) {
    return await prisma.saved.findFirst({
      where: {
        userId  : data.userId,
        recipeId: data.recipeId,
      },
    });
  };

  public async getSavedByRecipeId(recipeId: string) {
    return await prisma.saved.findMany({
      where: {
        recipeId: recipeId,
      },
    });
  };

  public async deleteAllSavedById(saveId: string[]) {
    return await prisma.saved.deleteMany({
      where: {
        id: {
          in: saveId,
        },
      },
    });
  };
};

export const saveService = new SaveService();