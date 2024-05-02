import { z } from "zod";

export const CreateCommentSchema = z.object({
  commentText: z.string().min(1).max(100),
  grade      : z.number().min(1).max(5),
});

export const CreateCommentReplySchema = z.object({
  commentText: z.string().min(1).max(100)
});

export const CommentReplySchema = z.object({
  commentText: z.string().min(1).max(100),
  commentId  : z.string(),
  userId     : z.string(),
  createdAt  : z.date().default(() => new Date()).optional(),
});

export const CommentSchema = z.object({
  recipeId      : z.string(),
  commentText   : z.string().min(1).max(100),
  grade         : z.number().min(1).max(5),
  userId        : z.string(),
  createdAt     : z.date().default(() => new Date())
});

export type ICommentSchema            = z.infer<typeof CommentSchema>;
export type ICreateCommentSchema      = z.infer<typeof CreateCommentSchema>;
export type ICommentReplySchema       = z.infer<typeof CommentReplySchema>;
export type ICreateCommentReplySchema = z.infer<typeof CreateCommentReplySchema>;