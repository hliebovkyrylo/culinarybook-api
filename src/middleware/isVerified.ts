import { User } from "@prisma/client";
import { 
  type Request, 
  type Response, 
  type NextFunction 
} from "express";

export const isVerifiedAccount = async (
  request : Request,
  response: Response,
  next    : NextFunction,
) => {
  const user = request.user as User;

  if (user.isVerified === false) {
    return response.status(403).send({
      code: "account-not-verified",
      message: "Youre account not verified!"
    });
  }

  return next();
};