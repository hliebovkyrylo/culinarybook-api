import { Socket }      from "socket.io";
import { verifyToken } from "../utils/token";
import { userService } from "../services/user.service";

export const isAuthSocket = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const accessToken = socket.handshake.headers.authorization

    if (!accessToken) {
      return next(new Error('No jwt provided'));
    }

    const id = verifyToken(accessToken);
    const user = userService.getUserById(id);

    if (!user) {
      return next(new Error('User not found'));
    }
  } catch (err) {
    return next(new Error('Error parsing verifying token'));
  }

  return next();
};

