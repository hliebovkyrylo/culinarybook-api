import { Router } from "express";
import { isAuth } from "../middleware/isAuth";
import { isVerifiedAccount } from "../middleware/isVerified";
import { notificationController } from "../controllers/notifications.controller";

export const notificationRoute = Router();

notificationRoute.get('/get/my/all', isAuth, isVerifiedAccount, notificationController.getAllMyNotifications);
notificationRoute.get('/get/my/all/unreaded', isAuth, isVerifiedAccount, notificationController.getAllMyUnreadedNotifications);