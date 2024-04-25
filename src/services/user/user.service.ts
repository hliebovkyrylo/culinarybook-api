import { prisma }                from "../..";
import { IUpdateUserInfoSchema } from "../../schemas/user.schema";

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

  public async searchUsersByUsername(username: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip,
      where: {
        username: {
          contains: username,
          mode    : "insensitive",
        },
      },
      take: limit,
      include: {
        _count: {
          select: {
            follows: true,
            recipe: true,
          },
        },
      },
    });

    const followerCounts = await prisma.follow.groupBy({
      by: ['userId'],
      _count: { userId: true },
    });
  
    const recipeCounts = await prisma.user.findMany({
      select: {
        id: true,
        _count: {
          select: { recipe: true },
        },
      },
    });
  
    const usersWithCounts = users.map((user) => {
      const followerCount = followerCounts.find(
        (count) => count.userId === user.id
      )?._count.userId ?? 0;
  
      const recipeCount = recipeCounts.find(
        (count) => count.id === user.id
      )?._count.recipe ?? 0;
  
      return { ...user, followerCount, recipeCount };
    });
  
    return usersWithCounts;
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

  public async changeAccountType(userId: string, isPrivate: boolean) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isPrivate: !isPrivate,
      },
    });
  };

  public async getAllUsers() {
    const users = await prisma.user.findMany({
      where: { isPrivate: false },
      include: {
        _count: {
          select: {
            follows: true,
            recipe: true,
          },
        },
      },
    });
  
    const followerCounts = await prisma.follow.groupBy({
      by: ['userId'],
      _count: { userId: true },
    });
  
    const recipeCounts = await prisma.user.findMany({
      select: {
        id: true,
        _count: {
          select: { recipe: true },
        },
      },
    });
  
    const usersWithCounts = users.map((user) => {
      const followerCount = followerCounts.find(
        (count) => count.userId === user.id
      )?._count.userId ?? 0;
  
      const recipeCount = recipeCounts.find(
        (count) => count.id === user.id
      )?._count.recipe ?? 0;
  
      return { ...user, followerCount, recipeCount };
    });
  
    return usersWithCounts;
  }
};

export const userService = new UserService();