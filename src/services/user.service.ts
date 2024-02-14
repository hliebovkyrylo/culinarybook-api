import { prisma } from "..";

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
};

export const userService = new UserService();