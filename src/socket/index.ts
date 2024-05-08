import { Server }         from "socket.io";
import { SocketWithUser } from "../typings/socket";
import { notificationService } from "../services/notification.service";

export const userSockets: Record<string, string> = {};

export const socket = (io: Server) => {
  io.on('connection', (socket: SocketWithUser) => {
    socket.on('userConnect', (userId: string) => {
      userSockets[userId] = socket.id;
    });

    socket.on('disconnect', () => {
      const userId = Object.keys(userSockets).find(key => userSockets[key] === socket.id);
      if (userId) {
        delete userSockets[userId];
      }
    });

    socket.on('getNotifications', async (userId: string) => {
      const recipientSocketId = userSockets[userId];

      socket.emit('loading_start');

      let notifications = await notificationService.getNotificationsByUserId(userId);
    
      await notificationService.changeNotificationReadStatus(notifications.map(notification => notification.id));

      notifications = await notificationService.getNotificationsByUserId(userId);

      io.to(recipientSocketId).emit("notifications", notifications);

      socket.emit('loading_end');
    });

    socket.on('getUnreadedNotifications', async (userId: string) => {
      const recipientSocketId     = userSockets[userId];
      const unreadedNotifications = await notificationService.getUnreadedNotifications(userId);

      io.to(recipientSocketId).emit("unreadedNotifications", unreadedNotifications.length);
    })
  })
}