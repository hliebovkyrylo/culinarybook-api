import { Router }            from "express";
import { followController }  from "../controllers/user/follow.controller";
import { isAuth }            from "../middleware/auth/isAuth";
import { isVerifiedAccount } from "../middleware/auth/isVerified";

export const followRoute = Router();

followRoute.post('/:userId', isAuth, isVerifiedAccount, followController.follow);
followRoute.delete('/:userId/unfollow', isAuth, isVerifiedAccount, followController.unfollow);
followRoute.get('/getMyFollowers', isAuth, isVerifiedAccount, followController.getMyFollowers);
followRoute.get('/getUserFollowers', followController.getUserFollowers);