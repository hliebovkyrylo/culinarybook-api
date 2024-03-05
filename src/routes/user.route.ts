import { Router }               from "express";
import { isAuth }               from "../middleware/auth/isAuth";
import { isVerifiedAccount }    from "../middleware/auth/isVerified";
import { userController }       from "../controllers/user/user.controller";
import { validate }             from "../utils/validate";
import { UdpateUserInfoSchema } from "../schemas/user.schema";

export const userRoute = Router();

userRoute.get('/me', isAuth, isVerifiedAccount, userController.getMe);
userRoute.get('/:userId', userController.getUser);
userRoute.get('/', userController.searchUserByUsername);
userRoute.patch('/update', isAuth, isVerifiedAccount, validate(UdpateUserInfoSchema), userController.updateUser);