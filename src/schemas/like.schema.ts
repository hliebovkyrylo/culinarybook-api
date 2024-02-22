import { z } from "zod";

export const LikeSchema = z.object({
  recipeId: z.string(),
  userId  : z.string(),
});

export type ILikeSchema = z.infer<typeof LikeSchema>;