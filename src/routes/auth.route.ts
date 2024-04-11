import { Router }                      from "express";
import { authController }              from "../controllers/user/auth.controller";
import { validate }                    from "../utils/validate";
import {
  ChangePasswordSchema,
  SignInSchema,
  SignUpSchema
}                                      from "../schemas/auth.schema";
import { isAuth }                      from "../middleware/auth/isAuth";
import { isCodeExprired }              from "../middleware/auth/isCodeExpired";
import { isForgotPasswordCodeExpired } from "../middleware/auth/isForgotPasswordCodeExpired";

export const authRoute = Router();

authRoute.post('/sign-up', validate(SignUpSchema), authController.signUp);
authRoute.post('/sign-in', validate(SignInSchema), authController.signIn);
authRoute.post('/send-code', isAuth, authController.sendConfirmationCode);
authRoute.post('/verify-email', isAuth, isCodeExprired, authController.verifyEmail);
authRoute.post('/forgot-password', authController.forgotPassword);
authRoute.post('/resent-code', isAuth, authController.resendConfirmationCode);
authRoute.patch('/change-password', isAuth, validate(ChangePasswordSchema), authController.changePassword);
authRoute.patch('/canReset-password/:email', isForgotPasswordCodeExpired, authController.canResetPassword);
authRoute.patch('/reset-password/:email', authController.resetPassword);