import { prisma }        from "..";
import { ICreateFollow } from "../schemas/user.schema";

class FollowService {
  public async createFollow(data: Omit<ICreateFollow, "id">) {
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
};

export const followService = new FollowService();