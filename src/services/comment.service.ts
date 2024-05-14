import { prisma }         from "..";
import { ICommentReplySchema, ICommentSchema } from "../schemas/comment.schema";

class CommentService {
  public async createComment(data: Omit<ICommentSchema, "id">) {
    return await prisma.comment.create({ data });
  };

  public async getCommentsByText(userId: string, commentText: string, recipeId: string) {
    return await prisma.comment.findMany({
      where: {
        userId: userId,
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
      include: {
        user        : true,
        commentReply: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
    });
  };

  public async deleteComment(commentId: string) {
    await prisma.commentReply.deleteMany({
      where: {
        commentId: commentId,
      },
    });

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
      include: {
        user: true
      }
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
      include: {
        user: true
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

  public async deleteCommentRepliesByRecipeId(recipeId: string) {
    const parentComments = await prisma.comment.findMany({
      where: {
        recipeId: recipeId,
      },
    });

    const parentCommentsIds = parentComments.map((comment) => comment.id);

    return await prisma.commentReply.deleteMany({
      where: {
        commentId: {
          in: parentCommentsIds
        }
      }
    });
  };

  public async getCommentsByRecipeIds(recipeIds: string[]) {
    return await prisma.comment.findMany({
      where: {
        recipeId: {
          in: recipeIds,
        },
      },
    });
  };
};

export const commentService = new CommentService();