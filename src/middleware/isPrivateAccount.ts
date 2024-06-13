import { 
  type NextFunction, 
  type Request, 
  type Response 
}                        from "express";
import { userService }   from "../services/user.service";
import { verifyToken }   from "../utils/token";
import { followService } from "../services/follow.service";``

export const isPrivateAccount = async (request: Request, response: Response, next: NextFunction) => {
  const userId      = request.params.userId;
  const accessToken = request.headers.authorization;
  
  const user = await userService.getUserById(userId);
  let userMe;

  if (user === null) {
    return response.status(404).send({
      code   : "user-not-found", 
      message: "User nor found!"
    });
  }

  if (accessToken) {
    const id = verifyToken(accessToken as string);

    const findedUserMe = await userService.getUserById(id);

    if (findedUserMe === null) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!"
      });
    }

    userMe = findedUserMe;

    const isFollowed = followService.getFollowerByIds(id, userId);

    if (isFollowed !== null) {
      return next();
    }
  }

  if (user.isPrivate === true && userMe?.id !== user.id) {
    return response.status(403).send({
      code   : "private-account",
      message: "This account is private!"
    });
  }

  next();
};