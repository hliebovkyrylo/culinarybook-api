import { prisma }                    from "../..";
import { ICreateNotificationSchema } from "../../schemas/notification.schema";

class NotificationService {
  public async craeteNotification(data: Omit<ICreateNotificationSchema, "id">) {
    return await prisma.notification.create({ data });
  };
};

export const notificationService = new NotificationService();