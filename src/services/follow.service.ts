import { prisma }        from "..";
import { IFollowSchema } from "../schemas/user.schema";

class FollowService {
  public async createFollow(data: Omit<IFollowSchema, "id">) {
    return await prisma.follow.create({ data });
  };

  public async isAlreadyFollowed(userId: string, followerId: string) {
    return await prisma.follow.findFirst({
      where: {
        followerId: followerId,
        userId: userId,
      },
    });
  };

  public async findFollow(data: IFollowSchema) {
    return await prisma.follow.findFirst({
      where: {
        followerId: data.followerId,
        userId    : data.userId,
      },
    });
  };

  public async deleteFollow(followId: string) {
    return await prisma.follow.delete({
      where: {
        id: followId,
      },
    });
  };

  public async getUserFollowers(userId: string) {
    return await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
    });
  };
};

export const followService = new FollowService();