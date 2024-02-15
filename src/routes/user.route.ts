import { Router } from "express";
import { isAuth } from "../middleware/auth/isAuth";
import { isVerifiedAccount } from "../middleware/auth/isVerified";
import { userController } from "../controllers/user.controller";

export const userRoute = Router();

userRoute.get('/me', isAuth, isVerifiedAccount, userController.getMe);