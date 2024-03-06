import { 
  type Request, 
  type Response, 
  type NextFunction 
}                      from "express";
import { authService } from "../../services/user/auth.service";
import { User } from "@prisma/client";

export const isCodeExprired = async (
  request : Request,
  response: Response,
  next    : NextFunction,
) => {
  const user = request.user as User;

  const code = user && await authService.GetVerificationCodeByUserId(user.id);

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