import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { ICommentSchema }              from "../schemas/comment.schema";
import { commentService }              from "../services/comment.service";
import { CommentDTO }                  from "../dtos/comment.dto";
import { userService } from "../services/user.service";

class CommentController {
  public async create(request: Request, response: Response) {
    const user     = request.user as User;
    const recipeId = request.params.recipeId;
    const data     = request.body as Omit<ICommentSchema, "authorUsername" | "authorImage">;

    const comments = await commentService.getCommentsByText(data.commentText, recipeId);

    if (comments.length > 4) {
      return response.status(409).send({
        code: "same-text",
        message: "You have posted more than 5 comments with the same text, please change it!"
      });
    }

    const comment = await commentService.createComment(
      { 
        ...data, 
        authorImage   : user.image, 
        recipeId      : recipeId,
        authorUsername: user.username 
      }
    );

    const commentDTO = new CommentDTO(comment);

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

    const commentAuthor = await userService.getUserByUsername(comment.authorUsername) as User;

    if (user.id.toString() !== commentAuthor.id.toString()) {
      return response.status(403).send({
        code   : "have-no-access",
        message: "You have no access to change it!",
      });
    }

    await commentService.deleteComment(commentId);

    response.send("Comment deleted!");
  };
};

export const commentController = new CommentController();