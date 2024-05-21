import { Router }               from "express";
import { isAuth }               from "../middleware/isAuth";
import { isVerifiedAccount }    from "../middleware/isVerified";
import { userController }       from "../controllers/user.controller";
import { validate }             from "../utils/validate";
import { UdpateUserInfoSchema } from "../schemas/user.schema";

export const userRoute = Router();

userRoute.get('/me', isAuth, isVerifiedAccount, userController.getMe);
userRoute.get('/:userId', userController.getUser);
userRoute.patch('/update', isAuth, isVerifiedAccount, validate(UdpateUserInfoSchema), userController.updateUser);
userRoute.patch('/changeType', isAuth, isVerifiedAccount, userController.updateAccountType);
userRoute.get('/recommended/users', isAuth, isVerifiedAccount, userController.getRecommendedUsers);
userRoute.get('/popular/users', userController.getPopularUsers);