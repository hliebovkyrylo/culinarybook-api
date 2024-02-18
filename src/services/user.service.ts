import { prisma }                from "..";
import { IUpdateUserInfoSchema } from "../schemas/user.schema";

class UserService {
  public async getUserByEmail(email: string) {
    return await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
  };

  public async getUserByUsername(username: string) {
    return await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
  };

  public async getUserById(id: string) {
    return await prisma.user.findFirst({
      where: {
        id: id,
      },
    });
  };

  public async updatePassword(userId: string, password: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: password,
      },
    });
  };

  public async allowResetPassword(userId: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        canResetPassword: true
      }
    })
  };

  public async prohibitResetPassword(userId: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        canResetPassword: false
      }
    })
  };

  public async searchUsersByUsername(username: string) {
    return await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode    : "insensitive",
        },
      },
    });
  };

  public async updateUserInfo(userId: string, data: IUpdateUserInfoSchema) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: data.username,
        name    : data.name,
        image   : data.image,
      },
    });
  };
};

export const userService = new UserService();