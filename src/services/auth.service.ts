import { prisma }                 from "..";
import { 
  ICreateVerificationCodeSchema, 
  ISignUpSchema 
}                                 from "../schemas/auth.schema";
import nodemailer                 from "nodemailer";

class AuthService {
  public async SignUp(data: Omit<ISignUpSchema, "id">) {
    return await prisma.user.create({ data });
  };

  public async UpdateEmailStatus(id: string) {
    return await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isVerified: true,
      },
    });
  };

  public async CreateCode(data: Omit<ICreateVerificationCodeSchema, "id">) {
    return await prisma.verificationCode.create({ data });
  };

  public async SendCode(email: string, code: string) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER as string,
        pass: process.env.NODEMAILER_PASS as string,
      },
    });

    let mailOptions = {
      from   : process.env.NODEMAILER_USER as string,
      to     : email,
      subject: "Your confirmation code for Recipebook✅",
      text   : "Your confirmation code: " + code
    };

    await transporter.sendMail(mailOptions);

    return "Code sent!" 
  };

  public async GetVerificationCodeByUserId(userId: string) {
    return await prisma.verificationCode.findFirst({
      where: {
        userId: userId
      },
    });
  };

  public async DeleteVerficationCode(codeId: string) {
    return await prisma.verificationCode.delete({
      where: {
        id: codeId,
      },
    });
  };
};

export const authService = new AuthService();