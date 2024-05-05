import { Router }            from "express";
import { isAuth }            from "../middleware/isAuth";
import { isVerifiedAccount } from "../middleware/isVerified";
import { likeController }    from "../controllers/like.controller";
import { accessToRecipe }    from "../middleware/accessToRecipe";

export const likeRoute = Router();

likeRoute.post("/create/:recipeId", isAuth, isVerifiedAccount, accessToRecipe, likeController.createLike);
likeRoute.delete("/:recipeId/remove", isAuth, isVerifiedAccount, likeController.removeLike);
likeRoute.get("/:recipeId/getAll", accessToRecipe, likeController.getRecipeLikes);
likeRoute.get("/recipe/:recipeId/isLiked", isAuth, isVerifiedAccount, likeController.getLikeState);