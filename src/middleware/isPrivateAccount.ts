import { 
  type NextFunction, 
  type Request, 
  type Response 
}                      from "express";
import { userService } from "../services/user.service";
import { verifyToken } from "../utils/token";
import { followService } from "../services/follow.service";

export const isPrivateAccount = async (request: Request, response: Response, next: NextFunction) => {
  const userId = request.params.userId;

  const user = await userService.getUserById(userId);

  if (user === null) {
    return response.status(404).send({
      code   : "user-not-found", 
      message: "User nor found!"
    });
  }

  const accessToken = request.headers.authorization;

  if (accessToken) {
    const id = verifyToken(accessToken);

    const isFollowed = followService.getFollowerByIds(id, userId);

    if (isFollowed !== null) {
      return next();
    }
  }

  if (user.isPrivate === true) {
    return response.status(403).send({
      code   : "private-account",
      message: "This account is private!"
    });
  }

  next();
};