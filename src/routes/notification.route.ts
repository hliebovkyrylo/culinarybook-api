import { Router }                 from "express";
import { isAuth }                 from "../middleware/auth/isAuth";
import { isVerifiedAccount }      from "../middleware/auth/isVerified";
import { notificationController } from "../controllers/user/notification.controller";

export const notificationRoute = Router();

notificationRoute.get('/getAll', isAuth, isVerifiedAccount, notificationController.getAll);