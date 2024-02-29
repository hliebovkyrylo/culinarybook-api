import { prisma }            from "..";
import { ICreateStepSchema } from "../schemas/recipe.schema";

class StepService {
  public async createStep(data: Omit<ICreateStepSchema, "id">[]) {
    return await prisma.step.createMany({ data: data.map(step => ({ ...step })) });
  };

  public async getStepsByRecipeId(recipeId: string) {
    return await prisma.step.findMany({
      where: {
        recipeId: recipeId,
      },
    });
  };
};

export const stepService = new StepService();