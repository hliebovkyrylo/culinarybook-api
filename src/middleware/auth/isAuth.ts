import { 
  type Response, 
  type Request, 
  type NextFunction 
}                      from "express";
import { 
  JsonWebTokenError, 
  TokenExpiredError 
}                      from "jsonwebtoken";
import { verifyToken } from "../../utils/token";
import { userService } from "../../services/user/user.service";


export const isAuth = async (
  request : Request,
  response: Response,
  next    : NextFunction
) => {
  try {
    const accessToken = request.headers.authorization;

    if (!accessToken) {
      return response.status(401).send({
        code   : "no-jwt",
        message: "No jwt provided!"
      });
    }

    const id   = verifyToken(accessToken);
    const user = await userService.getUserById(id);

    if (!user) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!",
      });
    }

    request.user = user

    return next();

  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return response.status(401).send({
        code   : "jwt-expired",
        message: "Access token has expired"
      });
    }

    if (error instanceof JsonWebTokenError) {
      return response.status(401).send({
        code   : "jwt-invalid",
        message: "Access token is not valid"
      });
    }

    console.log(error)
  }
};