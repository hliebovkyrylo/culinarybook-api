import { prisma }        from "../..";
import { ICreateFollowRequestSchema, IFollowSchema } from "../../schemas/user.schema";

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

  public async getUserFollowers(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const followers = await prisma.follow.findMany({
      skip,
      where: {
        userId: userId,
      },
      take: limit,
    });

    const followersIds = followers.map(following => following.followerId);

    return await prisma.user.findMany({
      where: {
        id: {
          in: followersIds,
        },
      },
    });
  };

  public async getFollowingsByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const followings = await prisma.follow.findMany({
      skip,
      where: {
        followerId: userId,
      },
      take: limit,
    });

    const followingsIds = followings.map(following => following.userId);

    return await prisma.user.findMany({
      where: {
        id: {
          in: followingsIds,
        },
      },
    });
  };

  public async getFollowStatus(userId: string, followerIds: string[]): Promise<boolean[]> {
    const followStatusData = await prisma.follow.findMany({
      where: {
        followerId: userId,
        userId: {
          in: followerIds,
        },
      },
      select: {
        userId: true,
      },
    });
  
    const followStatus = followerIds.map((followerId) =>
      followStatusData.some((follow) => follow.userId === followerId)
    );
  
    return followStatus;
  };

  public async createFollowRequest(data: Omit<ICreateFollowRequestSchema, "id">) {
    return await prisma.followRequest.create({ data });
  };

  public async getFollowRequestByIds(requesterId: string, requestedId: string) {
    return await prisma.followRequest.findFirst({
      where: {
        requestedId: requestedId,
        requesterId: requesterId,
      },
    });
  };

  public async deleteFollowRequestById(followRequestId: string) {
    return await prisma.followRequest.delete({
      where: {
        id: followRequestId,
      },
    });
  };
};

export const followService = new FollowService();