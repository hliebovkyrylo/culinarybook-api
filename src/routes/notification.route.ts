import { Router }                 from "express";
import { isAuth }                 from "../middleware/isAuth";
import { isVerifiedAccount }      from "../middleware/isVerified";
import { notificationController } from "../controllers/notification.controller";

export const notificationRoute = Router();

notificationRoute.get('/getAll', isAuth, isVerifiedAccount, notificationController.getAll);
notificationRoute.get('/unreaded/count', isAuth, isVerifiedAccount, notificationController.getUnreadedNotificationCount);