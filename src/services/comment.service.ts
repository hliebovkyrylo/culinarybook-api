import { prisma }         from "..";
import { ICommentSchema } from "../schemas/comment.schema";

class CommentService {
  public async createComment(data: Omit<ICommentSchema, "id">) {
    return await prisma.comment.create({ data });
  };

  public async getCommentsByText(commentText: string, recipeId: string) {
    return await prisma.comment.findMany({
      where: {
        recipeId: recipeId,
        commentText: {
          contains: commentText,
          mode    : "insensitive",
        },
      },
    });
  };

  public async getCommentsByRecipeId(recipeId: string) {
    return await prisma.comment.findMany({
      where: {
        recipeId: recipeId,
      },
      orderBy: {
        createdAt: "desc"
      },
    });
  };
};

export const commentService = new CommentService();