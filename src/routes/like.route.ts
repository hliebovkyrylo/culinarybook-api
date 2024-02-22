import { Router } from "express";
import { isAuth } from "../middleware/auth/isAuth";
import { isVerifiedAccount } from "../middleware/auth/isVerified";
import { likeController } from "../controllers/like.controller";

export const likeRoute = Router();

likeRoute.post("/create/:recipeId", isAuth, isVerifiedAccount, likeController.createLike);
likeRoute.delete("/:likeId/remove", isAuth, isVerifiedAccount, likeController.removeLike);