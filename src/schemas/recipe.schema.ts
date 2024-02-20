import { z } from "zod";

export const CreateRecipeSchema = z.object({
  ownerId     : z.string(),
  title       : z.string().min(1).max(80),
  image       : z.string().default(""),
  coockingTime: z.string().max(32),  
  complexity  : z.string(),
  typeOfFood  : z.string(),
  ingradients : z.string(),
});

export type ICreateRecipeSchema = z.infer<typeof CreateRecipeSchema>;