import { prisma }         from "../..";
import { ICommentSchema } from "../../schemas/comment.schema";

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

  public async deleteComment(commentId: string) {
    return await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
  };

  public async getCommentById(commentId: string) {
    return await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    });
  };

  public async deleteCommentsByIds(commentId: string[]) {
    return await prisma.comment.deleteMany({
      where: {
        id: {
          in: commentId,
        },
      },
    });
  };
};

export const commentService = new CommentService();