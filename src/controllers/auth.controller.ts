import { 
  type Request, 
  type Response 
}                            from "express";
import crypto                from "crypto";
import nodemailer            from "nodemailer";
import bcrypt                from "bcrypt";
import { 
  ISignInSchema, 
  ISignUpSchema 
}                            from "../schemas/auth.schema";
import { userService }       from "../services/user.service";
import { authService }       from "../services/auth.service";
import { createAccessToken } from "../utils/token";

class AuthController {
  public async SignUp(request: Request, response: Response) {
    const data = request.body as ISignUpSchema;

    const userWithSuchEmail    = await userService.getUserByEmail(data.email);
    const userWithSuchUsername = await userService.getUserByUsername(data.username);

    if (userWithSuchEmail !== null) {
      response.status(409).send({
        code   : "email-already-exist",
        message: "Such email already exist!"
      });
    }

    if (userWithSuchUsername !== null) {
      response.status(409).send({
        code   : "username-already-exist",
        message: "Such username already exist!"
      });
    }

    const password    = await bcrypt.hash(data.password, 8);
    const user        = await authService.SignUp({ ...data, password });
    const accessToken = createAccessToken(user.id);

    response.send({ accessToken });
  };

  public async SignIn(request: Request, response: Response) {
    const data = request.body as ISignInSchema;

    const user = await userService.getUserByEmail(data.email);

    if (user === null) {
      response.status(404).send({
        code   : "user-not-found",
        message: "This account was not found!"
      })
    }

    const isCorrectPassword = user && (await bcrypt.compare(data.password, user.password));

    if (!isCorrectPassword) {
      response.status(401).send({
        code   : "wrong-data",
        message: "The entered data is not valid"
      });
    }

    const accessToken = user && (createAccessToken(user.id));

    response.send({ accessToken });
  };

  public async SendVerifyCode(request: Request, response: Response) {
    const user = request.user;

    const code       = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(code, 8);

    if (user) {
      await authService.CreateVerificationCode({ userId: user.id, code: hashedCode });
    } else {
      response.status(401).send({
        code   : "unauthorized",
        message: "Unauthorized",
      });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER as string,
        pass: process.env.NODEMAILER_PASS as string,
      },
    });

    let mailOptions = {
      from   : process.env.NODEMAILER_USER as string,
      to     : user?.email,
      subject: "Your confirmation code for Recipebook✅",
      text   : "Your confirmation code: " + code
    };

    await transporter.sendMail(mailOptions);

    response.send("Code sent!");
  };

  public async CheckVerificationCode(request: Request, response: Response) {
    const user       = request.user;
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

    if (user.isVerified === false) {
      await authService.UpdateEmailStatus(user.id);
      await authService.DeleteVerficationCode(trueVerificationCode.id);

      response.send("Your account is verified!");
    } else {
      response.send("Your account is already verified!");
    }
    
  };
};

export const authController = new AuthController();