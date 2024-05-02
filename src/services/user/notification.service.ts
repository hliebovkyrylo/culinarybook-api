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
      include: {
        notificationCreator: true,
        recipe             : true
      }
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

  public async getNotificationsByRecipeId(recipeId: string) {
    return await prisma.notification.findMany({
      where: {
        recipeId: recipeId,
      }
    });
  };

  public async deleteNotificationsByRecipeId(recipeId: string[]) {
    return await prisma.notification.deleteMany({
      where: {
        recipeId: {
          in: recipeId
        },
      },
    });
  };

  public async getRecipeNotification(noficitaionCreatorId: string, recipeId: string, type: string) {
    return await prisma.notification.findFirst({
      where: {
        recipeId            : recipeId,
        noficitaionCreatorId: noficitaionCreatorId,
        type                : type,
      },
    });
  };

  public async getFollowNotification(noficitaionCreatorId: string, userId: string, type: string) {
    return await prisma.notification.findFirst({
      where: {
        userId              : userId,
        noficitaionCreatorId: noficitaionCreatorId,
        type                : type,
      },
    });
  };

  public async deleteNotification(notificationId: string) {
    return await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });
  };

  public async getUnreadedNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: {
        userId: userId,
        isRead: false,
      },
    });
  };
};

export const notificationService = new NotificationService();