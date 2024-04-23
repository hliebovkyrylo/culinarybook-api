import { Router }            from "express";
import { followController }  from "../controllers/user/follow.controller";
import { isAuth }            from "../middleware/auth/isAuth";
import { isVerifiedAccount } from "../middleware/auth/isVerified";
import { isPrivateAccount }  from "../middleware/isPrivateAccount";

export const followRoute = Router();

followRoute.post('/:userId', isAuth, isVerifiedAccount, followController.follow);
followRoute.delete('/:userId/unfollow', isAuth, isVerifiedAccount, followController.unfollow);
followRoute.get('/getMyFollowers', isAuth, isVerifiedAccount, followController.getMyFollowers);
followRoute.get('/:userId/followers', isPrivateAccount, followController.getUserFollowers);
followRoute.get('/my/followings', isAuth, isVerifiedAccount, followController.getMyFollowings);
followRoute.get('/:userId/followings', isPrivateAccount, followController.getUserFollowings);
followRoute.post('/:userId/follow-request', isAuth, isVerifiedAccount, followController.requestFollow);
followRoute.delete('/:userId/cancel-request', isAuth, isVerifiedAccount, followController.cancelFollowRequest);
followRoute.get('/user/:userId/state', isAuth, isVerifiedAccount, followController.getFollowState);