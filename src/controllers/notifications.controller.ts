import { User } from "@prisma/client";
import { type Request, type Response } from "express";
import { notificationService } from "../services/notification.service";

class NotificationController {
  public async getAllMyNotifications(request: Request, response: Response) {
    const user = request.user as User;
    const notifications = await notificationService.getNotificationsByUserId(user.id);

    response.send(notifications);
  };

  public async getAllMyUnreadedNotifications(request: Request, response: Response) {
    const user = request.user as User;
    const unreadedNotifications = await notificationService.getUnreadedNotifications(user.id);

    response.send(unreadedNotifications);
  }
}

export const notificationController = new NotificationController();