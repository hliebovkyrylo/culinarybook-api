import { z } from "zod";

export const CreateCommentSchema = z.object({
  commentText: z.string().min(1).max(600),
  grade      : z.number().min(1).max(5),
});

export const CommentSchema = z.object({
  recipeId      : z.string(),
  authorUsername: z.string(),
  authorImage   : z.string(),
  commentText   : z.string().min(1).max(600),
  grade         : z.number().min(1).max(5),
  createdAt     : z.date().default(() => new Date())
});

export type ICommentSchema       = z.infer<typeof CommentSchema>;
export type ICreateCommentSchema = z.infer<typeof CreateCommentSchema>;