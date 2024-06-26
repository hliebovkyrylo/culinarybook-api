import { Router }            from "express";
import { followController }  from "../controllers/follow.controller";
import { isAuth }            from "../middleware/isAuth";
import { isVerifiedAccount } from "../middleware/isVerified";
import { isPrivateAccount }  from "../middleware/isPrivateAccount";

export const followRoute = Router();

followRoute.post('/:userId', isAuth, isVerifiedAccount, followController.follow);
followRoute.delete('/:userId/unfollow', isAuth, isVerifiedAccount, followController.unfollow);
followRoute.get('/:userId/followers', isPrivateAccount, followController.getUserFollowers);
followRoute.get('/:userId/followings', isPrivateAccount, followController.getUserFollowings);
followRoute.post('/:userId/follow-request', isAuth, isVerifiedAccount, followController.requestFollow);
followRoute.delete('/:userId/cancel-request', isAuth, isVerifiedAccount, followController.cancelFollowRequest);
followRoute.get('/user/:userId/state', isAuth, isVerifiedAccount, followController.getFollowState);
followRoute.get('/user/:userId/follow-request-state', isAuth, isVerifiedAccount, followController.getFollowRequestState);