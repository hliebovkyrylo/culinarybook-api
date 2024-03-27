import { prisma }         from "../..";
import { ICommentReplySchema, ICommentSchema } from "../../schemas/comment.schema";

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

  public async createCommentReply(data: Omit<ICommentReplySchema, "id">) {
    return await prisma.commentReply.create({ data });
  };

  public async getCommentRepliesByText(commentText: string, commentId: string, userId: string) {
    return await prisma.commentReply.findMany({
      where: {
        userId     : userId,
        commentId  : commentId,
        commentText: {
          contains: commentText,
          mode    : "insensitive",
        },
      },
    });
  };

  public async getCommentRepliesByCommentId(commentId: string) {
    return await prisma.commentReply.findMany({
      where: {
        commentId: commentId,
      },
      orderBy: {
        createdAt: "desc"
      },
    });
  };

  public async getCommentReplyById(commentReplyId: string) {
    return await prisma.commentReply.findFirst({
      where: {
        id: commentReplyId,
      },
    });
  };

  public async deleteCommentReply(commentReplyId: string) {
    return await prisma.commentReply.delete({
      where: {
        id: commentReplyId,
      },
    });
  };
};

export const commentService = new CommentService();