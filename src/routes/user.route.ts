import { Router }               from "express";
import { isAuth }               from "../middleware/auth/isAuth";
import { isVerifiedAccount }    from "../middleware/auth/isVerified";
import { userController }       from "../controllers/user/user.controller";
import { validate }             from "../utils/validate";
import { UdpateUserInfoSchema } from "../schemas/user.schema";
import { isPrivateAccount }     from "../middleware/isPrivateAccount";

export const userRoute = Router();

userRoute.get('/me', isAuth, isVerifiedAccount, userController.getMe);
userRoute.get('/:userId', isPrivateAccount, userController.getUser);
userRoute.get('/', userController.searchUserByUsername);
userRoute.patch('/update', isAuth, isVerifiedAccount, validate(UdpateUserInfoSchema), userController.updateUser);
userRoute.patch('/changeType', isAuth, isVerifiedAccount, userController.updateAccountType);
userRoute.get('/recommended/users', isAuth, isVerifiedAccount, userController.getRecommendedUsers);