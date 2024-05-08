import { User }   from "@prisma/client";
import { Socket } from "socket.io";

declare global {
  namespace SocketIO {
    interface Socket {
      user?: User;
    }
  }
}

export interface SocketWithUser extends Socket {
  user?: User;
}