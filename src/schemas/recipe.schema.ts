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

export type ICreateRecipeSchema = z.infer<typeof CreateRecipeSchema>;
export type IUpdateRecipeSchema = z.infer<typeof UpdateRecipeSchema>;