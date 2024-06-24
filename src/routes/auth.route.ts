import { Router }                      from "express";
import { authController }              from "../controllers/auth.controller";
import { validate }                    from "../utils/validate";
import {
  ChangePasswordSchema,
  SignInSchema,
  SignUpSchema
}                                      from "../schemas/auth.schema";
import { isAuth }                      from "../middleware/isAuth";
import { isCodeExprired }              from "../middleware/isCodeExpired";
import { isForgotPasswordCodeExpired } from "../middleware/isForgotPasswordCodeExpired";
import passport                        from "passport";

export const authRoute = Router();

const clientUrl = process.env.CLIENT_URL as string;

authRoute.post('/sign-up', validate(SignUpSchema), authController.signUp);
authRoute.post('/sign-in', validate(SignInSchema), authController.signIn);
authRoute.post('/send-code', isAuth, authController.sendConfirmationCode);
authRoute.post('/verify-email', isAuth, isCodeExprired, authController.verifyEmail);
authRoute.post('/forgot-password', authController.forgotPassword);
authRoute.post('/resent-code', isAuth, authController.resendConfirmationCode);
authRoute.patch('/change-password', isAuth, validate(ChangePasswordSchema), authController.changePassword);
authRoute.patch('/canReset-password/:email', isForgotPasswordCodeExpired, authController.canResetPassword);
authRoute.patch('/reset-password/:email', authController.resetPassword);
authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email']}));
authRoute.get ('/google/callback', passport.authenticate('google', { 
  failureRedirect: `${clientUrl}/sign-in`,
  successRedirect: `${clientUrl}` 
}), authController.googleAuthCallback);