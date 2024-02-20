import { Router }            from "express";
import { followController }  from "../controllers/follow.controller";
import { isAuth }            from "../middleware/auth/isAuth";
import { isVerifiedAccount } from "../middleware/auth/isVerified";

export const followRoute = Router();

followRoute.post('/:userId', isAuth, isVerifiedAccount, followController.follow);
followRoute.delete('/:userId/unfollow', isAuth, isVerifiedAccount, followController.unfollow);