import { Router }         from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../utils/validate";
import { SignInSchema, SignUpSchema } from "../schemas/auth.schema";
import { isAuth } from "../middleware/isAuth";

export const authRoute = Router();

authRoute.post('/sign-up', validate(SignUpSchema), authController.SignUp);
authRoute.post('/sign-in', validate(SignInSchema), authController.SignIn);
authRoute.post('/send-code', isAuth, authController.SendVerifyCode);
authRoute.post('/check-code', isAuth, authController.CheckVerificationCode);