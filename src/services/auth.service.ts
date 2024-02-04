import { prisma }                 from "..";
import { 
  ICreateVerificationCodeSchema, 
  ISignUpSchema 
}                                 from "../schemas/auth.schema";

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

  public async CreateVerificationCode(data: Omit<ICreateVerificationCodeSchema, "id">) {
    return await prisma.verificationCode.create({ data });
  };

  public async GetVerificationCodeByUserId(userId: string) {
    return await prisma.verificationCode.findFirst({
      where: {
        userId: userId
      },
    });
  };
};

export const authService = new AuthService();