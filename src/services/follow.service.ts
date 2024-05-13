import { prisma }                                    from "..";
import { ICreateFollowRequestSchema, IFollowSchema } from "../schemas/user.schema";

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

  public async getUserFollowers(userId: string, username: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return await prisma.follow.findMany({
      skip,
      where: {
        userId: userId,
        follower: {
          username: {
            contains: username,
            mode    : "insensitive",
          }
        }
      },
      include: {
        follower: true
      },
      take: limit,
    });
  };

  public async getAllFollowersByUserId(userId: string) {
    return await prisma.follow.findMany({
      where: {
        userId: userId,
      },
    });
  };

  public async getAllFollowingsByUserId(userId: string) {
    return await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
    });
  };

  public async getFollowingsByUserId(userId: string, username: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return await prisma.follow.findMany({
      skip,
      where: {
        followerId: userId,
        user: {
          username: {
            contains: username,
            mode    : "insensitive",
          }
        }
      },
      include: {
        user: true
      },
      take: limit,
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

  public async deleteFollowRequestsByIds(followIds: string[]) {
    return await prisma.followRequest.deleteMany({
      where: {
        id: {
          in: followIds,
        },
      },
    });
  };

  public async findFollowersByUsername(userId: string, username: string) {
    return await prisma.follow.findMany({
      where: {
        userId: userId,
        follower: {
          username: username
        }
      },
      include: {
        follower: true
      }
    })
  };

  public async getFollowerByIds(followerId: string, userId: string) {
    return await prisma.follow.findFirst({
      where: {
        userId    : userId,
        followerId: followerId,
      },
    });
  };

  public async getFollowRequestsByUserId(userId: string) {
    return await prisma.followRequest.findMany({
      where: {
        requestedId: userId,
      },
    });
  };
};

export const followService = new FollowService();