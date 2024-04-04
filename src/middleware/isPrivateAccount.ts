import { 
  type NextFunction, 
  type Request, 
  type Response 
}                      from "express";
import { userService } from "../services/user/user.service";

export const isPrivateAccount = async (request: Request, response: Response, next: NextFunction) => {
  const userId = request.params.userId;

  const user = await userService.getUserById(userId);

  if (user === null) {
    return response.status(404).send({
      code   : "user-not-found",
      message: "User nor found!"
    });
  }

  if (user.isPrivate === true) {
    return response.status(403).send({
      code   : "private-account",
      message: "This account is private!"
    });
  }

  next();
};