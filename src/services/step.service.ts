import { prisma }            from "..";
import { ICreateStepSchema, IUpdateStepSchema } from "../schemas/recipe.schema";

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

  public async getStepsByIds(stepId: string[]) {
    return await prisma.step.findMany({
      where: {
        id: {
          in: stepId
        },
      },
    });
  };

  public async updateStepsByIds(data: IUpdateStepSchema[]) {
    const promises = data.map(step =>
      prisma.step.update({
        where: { id: step.stepId },
        data: { stepDescription: step.stepDescription },
      })
    );
  
    return await Promise.all(promises);
  };
};

export const stepService = new StepService();