import { User }                                      from "@prisma/client";
import { type Request, type Response }               from "express";
import { ICommentSchema, ICreateCommentReplySchema } from "../../schemas/comment.schema";
import { commentService }                            from "../../services/recipe/comment.service";
import { CommentDTO, CommentReplyDTO }               from "../../dtos/comment.dto";
import { userService }                               from "../../services/user/user.service";
import { recipeService }                             from "../../services/recipe/recipe.service";
import { notificationService }                       from "../../services/user/notification.service";

class CommentController {
  public async create(request: Request, response: Response) {
    const user     = request.user as User;
    const recipeId = request.params.recipeId;
    const data     = request.body as Omit<ICommentSchema, "authorUsername" | "authorImage">;

    const comments = await commentService.getCommentsByText(user.id, data.commentText, recipeId);

    if (comments.length > 5) {
      return response.status(409).send({
        code   : "same-text",
        message: "You have posted more than 5 comments with the same text, please change it!"
      });
    }

    const comment = await commentService.createComment(
      { 
        ...data,
        recipeId      : recipeId,
        userId        : user.id
      }
    );

    const recipe = await recipeService.getRecipeById(recipeId);

    if (!recipe) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!"
      });
    }

    if (user.id !== recipe.ownerId) {
      await notificationService.craeteNotification({ userId: recipe.ownerId, noficitaionCreatorId: user.id, type: "comment", noficationData: data.commentText, recipeId: recipe.id, createdAt: new Date })
    }

    const commentDTO = new CommentDTO({ ...comment, user });

    response.send(commentDTO);
  };

  public async getComments(request: Request, response: Response) {
    const recipeId = request.params.recipeId as string;
    const comments = await commentService.getCommentsByRecipeId(recipeId);

    response.send(comments);
  };

  public async deleteComment(request: Request, response: Response) {
    const user      = request.user as User;
    const commentId = request.params.commentId;

    const comment = await commentService.getCommentById(commentId);

    if (comment === null) {
      return response.status(404).send({
        code   : "comment-not-found",
        message: "Comment not found!",
      });
    }

    const commentAuthor = await userService.getUserByUsername(comment.user.username) as User;

    if (user.id.toString() !== commentAuthor.id.toString()) {
      return response.status(403).send({
        code   : "have-no-access",
        message: "You have no access to change it!",
      });
    }

    await commentService.deleteComment(commentId);

    const notification = await notificationService.getRecipeNotification(user.id, comment.recipeId, 'comment');
    
    notification && await notificationService.deleteNotification(notification.id)

    response.send({ message: "Comment deleted!" });
  };

  public async createCommentReply(request: Request, response: Response) {
    const user      = request.user as User;
    const commentId = request.params.commentId as string;
    const data      = request.body as ICreateCommentReplySchema;

    const commentReplies = await commentService.getCommentRepliesByText(data.commentText, commentId, user.id);

    if (commentReplies.length > 4) {
      return response.status(409).send({
        code: "same-text",
        message: "You have posted more than 5 comments with the same text, please change it!"
      });
    }

    const commentReply    = await commentService.createCommentReply({ ...data, userId: user.id, commentId });
    const commentReplyDTO = new CommentReplyDTO({ ...commentReply, user });

    const comment = await commentService.getCommentById(commentId);

    if (comment === null) {
      return response.status(404).send({
        code   : "comment-not-found",
        message: "Comment not found!",
      });
    }

    if (user.id !== comment.userId) {
      await notificationService.craeteNotification({ userId: comment.userId, noficitaionCreatorId: user.id, type: "comment-reply", noficationData: data.commentText, recipeId: comment.recipeId, createdAt: new Date })
    }

    response.send(commentReplyDTO);
  };

  public async deleteCommentReply(request: Request, response: Response) {
    const user = request.user as User;
    const commentReplyId = request.params.commentReplyId as string;

    const commentReply = await commentService.getCommentReplyById(commentReplyId);

    if (commentReply === null) {
      return response.status(404).send({
        code   : "comment-reply-not-found",
        message: "Comment reply not found!",
      });
    }

    const comment = await commentService.getCommentById(commentReply.commentId);

    if (comment === null) {
      return response.status(404).send({
        code   : "comment-not-found",
        message: "Comment not found!",
      });
    }

    const recipe = await recipeService.getRecipeById(comment.recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!",
      });
    }

    if ((user.id.toString() !== commentReply.userId.toString()) && (user.id.toString() !== recipe.ownerId.toString())) {
      return response.status(403).send({
        code: "have-no-comment-access",
        message: "You can't manage other people's comments"
      });
    }

    await commentService.deleteCommentReply(commentReplyId);

    response.send({ message: "Comment deleted!" });
  }
};

export const commentController = new CommentController();