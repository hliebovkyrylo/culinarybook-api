import { z } from "zod";

export const CreateRecipeSchema = z.object({
  ownerId     : z.string().default(""),
  title       : z.string().min(1).max(80),
  image       : z.string(),
  coockingTime: z.string().max(32),  
  complexity  : z.string(),
  typeOfFood  : z.string(),
  ingradients : z.string(),
  isPublic    : z.boolean().default(true),
});

export const UpdateRecipeSchema = z.object({
  title       : z.string().min(1).max(80),
  image       : z.string(),
  coockingTime: z.string().max(32),  
  complexity  : z.string(),
  typeOfFood  : z.string(),
  ingradients : z.string(),
});

export const CreateVisitedRecipe = z.object({
  recipeId: z.string(),
  userId  : z.string(),
});

export const CreateStepSchema = z.object({
  recipeId       : z.string(),
  stepNumber     : z.number(),
  stepDescription: z.string().min(3).max(600),
});

export type ICreateRecipeSchema   = z.infer<typeof CreateRecipeSchema>;
export type IUpdateRecipeSchema   = z.infer<typeof UpdateRecipeSchema>;
export type ICreateVisitedRedcipe = z.infer<typeof CreateVisitedRecipe>;
export type ICreateStepSchema     = z.infer<typeof CreateStepSchema>;