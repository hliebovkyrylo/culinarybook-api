import { Router }              from "express";
import { isAuth }              from "../middleware/auth/isAuth";
import { isVerifiedAccount }   from "../middleware/auth/isVerified";
import { validate }            from "../utils/validate";
import { 
  CreateCommentReplySchema, 
  CreateCommentSchema 
}                              from "../schemas/comment.schema";
import { commentController }   from "../controllers/recipe/comment.controller";
import { accessToRecipe }      from "../middleware/recipe/accessToRecipe";

export const commentRoute = Router();

commentRoute.post("/create/:recipeId", isAuth, isVerifiedAccount, validate(CreateCommentSchema), commentController.create);
commentRoute.get("/getComments/:recipeId", accessToRecipe, commentController.getComments);
commentRoute.delete("/:commentId/delete", isAuth, isVerifiedAccount, commentController.deleteComment);
commentRoute.post("/:commentId/reply", isAuth, validate(CreateCommentReplySchema), commentController.createCommentReply);
commentRoute.delete("/reply/:commentReplyId/delete", isAuth, commentController.deleteCommentReply);