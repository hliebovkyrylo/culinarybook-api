import { prisma } from "..";
import { ICreateStepSchema } from "../schemas/recipe.schema";

class StepService {
  public async createStep(data: Omit<ICreateStepSchema, "id">[]) {
    return await prisma.step.createMany({ data: data.map(step => ({ ...step })) });
  };
};

export const stepService = new StepService();