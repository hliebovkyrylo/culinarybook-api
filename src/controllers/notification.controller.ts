import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { notificationService }         from "../services/notification.service";

class NotificationController {
  public async getAll(request: Request, response: Response) {
    const user        = request.user as User;
    let notifications = await notificationService.getNotificationsByUserId(user.id);
    
    await notificationService.changeNotificationReadStatus(notifications.map(notification => notification.id));

    notifications = await notificationService.getNotificationsByUserId(user.id);
    
    response.send(notifications);
  };

  public async getUnreadedNotificationCount(request: Request, response: Response) {
    const user                  = request.user as User;
    const unreadedNotifications = await notificationService.getUnreadedNotifications(user.id);

    response.send({ unreadedNotifications: unreadedNotifications.length });
  };
};

export const notificationController = new NotificationController();