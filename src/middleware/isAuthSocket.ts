import { Socket }      from "socket.io";
import { verifyToken } from "../utils/token";
import { userService } from "../services/user.service";
import cookie          from "cookie";

export const isAuthSocket = (socket: Socket, next: (err?: Error) => void) => {
  const cookiesStr = socket.handshake.headers.cookie;
  
  if (cookiesStr) {
    try {
      const cookies = cookie.parse(cookiesStr);
      const accessToken = cookies['access_token'];

      if (!accessToken) {
        return next(new Error('No jwt provided'));
      }
  
      const id = verifyToken(accessToken);
      const user = userService.getUserById(id);
  
      if (!user) {
        return next(new Error('User not found'));
      }
    } catch (err) {
      return next(new Error('Error parsing cookies or verifying token'));
    }
  } else {
    return next(new Error('No cookies provided'));
  }

  return next();
};

