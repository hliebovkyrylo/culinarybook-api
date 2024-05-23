import { 
  type Request, 
  type Response 
}                            from "express";
import crypto                from "crypto";
import bcrypt                from "bcrypt";
import { 
  IChangePasswordSchema,
  ISignInSchema, 
  ISignUpSchema 
}                            from "../schemas/auth.schema";
import { userService }       from "../services/user.service";
import { authService }       from "../services/auth.service";
import { createAccessToken, verifyToken } from "../utils/token";
import { User }              from "@prisma/client";

class AuthController {
  public async signUp(request: Request, response: Response) {
    const data = request.body as ISignUpSchema;

    const userWithSuchEmail    = await userService.getUserByEmail(data.email);
    const userWithSuchUsername = await userService.getUserByUsername(data.username);

    if (userWithSuchEmail !== null) {
      return response.status(409).send({
        code   : "email-already-exist",
        message: "Such email already exist!"
      });
    }

    if (userWithSuchUsername !== null) {
      return response.status(409).send({
        code   : "username-already-exist",
        message: "Such username already exist!"
      });
    }

    const password    = await bcrypt.hash(data.password, 8);
    const user        = await authService.SignUp({ ...data, password });
    const serialized  = createAccessToken(user.id);

    response.setHeader('Set-Cookie', serialized);
    response.send({ message: "Authorized" });
  };

  public async signIn(request: Request, response: Response) {
    const data = request.body as ISignInSchema;

    const user = await userService.getUserByEmail(data.email);

    if (user === null) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "This account was not found!"
      })
    }

    const isCorrectPassword = user && (await bcrypt.compare(data.password, user.password));

    if (!isCorrectPassword) {
      return response.status(401).send({
        code   : "wrong-data",
        message: "The entered data is not valid"
      });
    }

    const serialized  = createAccessToken(user.id);

    response.setHeader('Set-Cookie', serialized);
    response.send(user);
  };

  public async googleAuthCallback(request: Request, response: Response) {
    const user = request.user as User;
    const serialized  = createAccessToken(user.id);

    response.setHeader('Set-Cookie', serialized);
    response.redirect('/');
  };

  public async signOut(request: Request, response: Response) {
    response.clearCookie("access_token")
    response.redirect('/');
  }

  public async sendConfirmationCode(request: Request, response: Response) {
    const user = request.user as User;

    const code       = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(code, 8);

    const isCodeAlreadyExist = await authService.GetVerificationCodeByUserId(user.id);

    if (isCodeAlreadyExist !== null) {
      await authService.DeleteVerficationCode(isCodeAlreadyExist.id);
    }

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    await authService.CreateCode({ userId: user.id, code: hashedCode, expiryTime: expiryTime.getTime() });
    await authService.SendCode(user.email, code);

    response.send({ message: "Code sent!" });
  };

  public async resendConfirmationCode(request: Request, response: Response) {
    const user = request.user as User;

    const oldCode = user && await authService.GetVerificationCodeByUserId(user.id);

    if (!oldCode) {
      return response.status(404).send({
        code   : "failed-to-get-code",
        message: "Failed to get code!",
      });
    }

    await authService.DeleteVerficationCode(oldCode.id);

    const code       = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(code, 8);

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    await authService.CreateCode({ userId: user.id, code: hashedCode, expiryTime: expiryTime.getDate() });
    await authService.SendCode(user.email, code);

    response.send({ message: "Code sent!" });
  };

  public async verifyEmail(request: Request, response: Response) {
    const user       = request.user as User;
    const verifyCode = request.body.code as string;

    const trueVerificationCode = user && await authService.GetVerificationCodeByUserId(user.id);

    if (!trueVerificationCode) {
      return response.status(404).send({
        code   : "code-not-found",
        message: "Code not found!"
      });
    }

    const isCorrectCode = await bcrypt.compare(verifyCode, trueVerificationCode.code);

    if (!isCorrectCode) {
      return response.status(401).send({
        code   : "wrong-entered-code",
        message: "Wrong entered code!",
      });
    } 

    if (user.isVerified) {
      await authService.DeleteVerficationCode(trueVerificationCode.id);
      return response.status(400).send({
        code   : "account-already-verified",
        message: "Your account is already verified!"
      });
    }

    await authService.UpdateEmailStatus(user.id);
    await authService.DeleteVerficationCode(trueVerificationCode.id);

    response.send({message: "Your account is verified!"});
  };

  public async changePassword(request: Request, response: Response) {
    const user = request.user as User;
    const data = request.body as IChangePasswordSchema;

    const isMatchOldPassword = await bcrypt.compare(data.oldPassword, user.password);

    if (!isMatchOldPassword) {
      return response.status(401).send({
        code   : "password-mismatch",
        message: "Password mismatch!",
      });
    }

    if (data.newPassword !== data.confirmNewPassword) {
      return response.status(409).send({
        code   : "passwords-missmatch",
        message: "Passwords missmatch",
      });
    }

    const hashedNewPassword = await bcrypt.hash(data.newPassword, 8);

    await userService.updatePassword(user.id, hashedNewPassword);

    response.send({ message: "Password changed!" });
  };

  public async forgotPassword(request: Request, response: Response) {
    const email = request.body.email as string;

    const user = await userService.getUserByEmail(email);

    if (user === null) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found"
      });
    }

    const isCodeAlreadyExist = await authService.GetVerificationCodeByUserId(user.id);

    if (isCodeAlreadyExist !== null) {
      await authService.DeleteVerficationCode(isCodeAlreadyExist.id);
    }

    const code       = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(code, 8);

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    await authService.CreateCode({ userId: user.id, code: hashedCode, expiryTime: expiryTime.getTime() });
    await authService.SendCode(email, code);

    response.send({ message: "Code has been sent to your email!" });
  };

  public async canResetPassword(request: Request, response: Response) {
    const email = request.params.email as string
    const code  = request.body.code as string;

    const user = await userService.getUserByEmail(email);

    if (user === null) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!"
      });
    }

    const trueCode = user && await authService.GetVerificationCodeByUserId(user.id);

    if (!trueCode) {
      return response.status(404).send({
        code   : "code-not-found",
        message: "Code not found!",
      });
    }

    const isMatch = await bcrypt.compare(code, trueCode.code);

    if (isMatch === false) {
      return response.status(401).send({
        code   : "code-mismatch",
        message: "Code missmatch!",
      });
    }

    await userService.allowResetPassword(user.id);
    await authService.DeleteVerficationCode(trueCode.id);

    response.send({ message: "The code is correct!" });
  };

  public async resetPassword(request: Request, response: Response) {
    const email                         = request.params.email;
    const { password, confirmPassword } = request.body;

    const user = await userService.getUserByEmail(email);

    if (user === null) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!"
      });
    }
  
    const hashedNewPassword = await bcrypt.hash(password, 8);

    if (user.canResetPassword === false) {
      return response.status(403).send({
        code   : "Forbidden",
        message: "No rights to reset password!",
      });
    }

    if (password !== confirmPassword) {
      return response.status(409).send({
        code   : "password-mismatch",
        message: "Password mismatch!"
      });
    }

    await userService.updatePassword(user.id, hashedNewPassword);
    await userService.prohibitResetPassword(user.id);

    response.send({ message: "Password successfully restored" });
  };

  public async checkAuthStatus(request: Request, response: Response) {
    const accessToken = request.cookies?.access_token;
  
    if (!accessToken) {
      return response.send({ isAuth: false });
    }
  
    try {
      const id = verifyToken(accessToken);
      const user = await userService.getUserById(id);
  
      if (!user) {
        return response.send({ isAuth: false });
      }
  
      response.send({ isAuth: true });
    } catch (err) {
      console.error(err);
      return response.send({ isAuth: false });
    }
  };  
};

export const authController = new AuthController();