import { Router }         from "express";
import { authController } from "../controllers/auth.controller";
import { validate }       from "../utils/validate";
import {
  ChangePasswordSchema,
  SignInSchema,
  SignUpSchema
}                         from "../schemas/auth.schema";
import { isAuth }         from "../middleware/isAuth";

export const authRoute = Router();

authRoute.post('/sign-up', validate(SignUpSchema), authController.signUp);
authRoute.post('/sign-in', validate(SignInSchema), authController.signIn);
authRoute.post('/send-code', isAuth, authController.sendConfirmationCode);
authRoute.post('/check-code', isAuth, authController.verifyEmail);
authRoute.post('/resent-code', isAuth, authController.resendConfirmationCode);
authRoute.patch('/change-password', isAuth, validate(ChangePasswordSchema), authController.changePassword);