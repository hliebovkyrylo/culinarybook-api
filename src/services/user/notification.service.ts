import { prisma }                    from "../..";
import { ICreateNotificationSchema } from "../../schemas/notification.schema";

class NotificationService {
  public async craeteNotification(data: Omit<ICreateNotificationSchema, "id">) {
    return await prisma.notification.create({ data });
  };

  public async getNotificationsByUserId(userId: string) {
    return await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  };

  public async changeNotificationReadStatus(notificationsIds: string[]) {
    return await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationsIds
        },
      },
      data: {
        isRead: true,
      },
    });
  };
};

export const notificationService = new NotificationService();