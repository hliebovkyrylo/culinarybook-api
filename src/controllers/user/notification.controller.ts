import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { notificationService }         from "../../services/user/notification.service";

class NotificationController {
  public async getAll(request: Request, response: Response) {
    const user        = request.user as User;
    let notifications = await notificationService.getNotificationsByUserId(user.id);
    
    await notificationService.changeNotificationReadStatus(notifications.map(notification => notification.id));

    notifications = await notificationService.getNotificationsByUserId(user.id);
    
    response.send(notifications);
  };
};

export const notificationController = new NotificationController();