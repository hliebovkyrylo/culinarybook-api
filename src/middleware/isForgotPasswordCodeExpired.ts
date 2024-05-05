import { 
  type Request, 
  type Response, 
  type NextFunction 
}                      from "express";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";

export const isForgotPasswordCodeExpired = async (
  request : Request,
  response: Response,
  next    : NextFunction,
) => {
  const email = request.params.email as string;

  const user  = await userService.getUserByEmail(email);

  if (user === null) {
    return response.status(404).send({
      code   : "user-not-found",
      message: "User not found!"
    });
  }

  const code = await authService.GetVerificationCodeByUserId(user.id);

  if (!code) {
    return response.status(404).send({
      code   : "code-not-found",
      message: "Code is not found!",
    });
  }

  if (Date.now() > code.expiryTime) {
    await authService.DeleteVerficationCode(code.id);
    return response.status(400).send({
      code   : "code-expired",
      message: "Code expired!",
    });
  }

  return next();
};