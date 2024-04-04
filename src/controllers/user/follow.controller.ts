import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { followService }               from "../../services/user/follow.service";
import { notificationService }         from "../../services/user/notification.service";
import { UserPreviewDTO }              from "../../dtos/user.dto";

class FollowController {
  public async follow(request: Request, response: Response) {
    const user       = request.user as User;
    const followUser = request.params.userId as string;

    const isFollowed = await followService.isAlreadyFollowed(followUser, user.id);

    if (user.id.toString() === followUser) {
      return response.status(409).send({
        code   : "cant-follow",
        message: "You can't follow your account!"
      });
    }

    if (isFollowed !== null) {
      return response.status(409).send({
        code   : "you-already-followed",
        message: "You already followed to this user!"
      });
    }

    await followService.createFollow({ followerId: user.id, userId: followUser });

    await notificationService.craeteNotification({ userId: followUser, noficitaionCreatorId: user.id, type: "follow", noficationData: "", recipeId: "", createdAt: new Date })

    response.send("You following!");
  };

  public async unfollow(request: Request, response: Response) {
    const user       = request.user as User;
    const followUser = request.params.userId as string;

    const follow = await followService.findFollow({ userId: followUser, followerId: user.id });

    if (follow === null) {
      return response.status(404).send({
        code   : "unfollowed",
        message: "You are not followed it account!"
      });
    }

    await followService.deleteFollow(follow.id);

    const notification = await notificationService.getFollowNotification(user.id, follow.userId, "follow");

    notification && await notificationService.deleteNotification(notification.id);

    response.send("You unfollowing!");
  };

  public async getMyFollowers(request: Request, response: Response) {
    const user  = request.user as User;
    const page  = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string ) || 10;

    const followers = await followService.getUserFollowers(user.id, page, limit);
    const followersDTO = followers.map(follower => new UserPreviewDTO(follower));

    const followerIds = followers.map(follower => follower.id);

    const followStatus = await followService.getFollowStatus(user.id, followerIds);

    const followersWithStatus = followersDTO.map((followerDTO, index) => ({
      ...followerDTO,
      isFollowed: followStatus[index]
    }));

    response.send(followersWithStatus);
  };

  public async getUserFollowers(request: Request, response: Response) {
    const user  = request.params.userId as string;
    const page  = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string ) || 10;

    const followers = await followService.getUserFollowers(user, page, limit);
    const followersDTO = followers.map(follower => new UserPreviewDTO(follower));

    const followerIds = followers.map(follower => follower.id);

    const followStatus = await followService.getFollowStatus(user, followerIds);

    const followersWithStatus = followersDTO.map((followerDTO, index) => ({
      ...followerDTO,
      isFollowed: followStatus[index]
    }));

    response.send(followersWithStatus);
  };

  public async getMyFollowings(request: Request, response: Response) {
    const user  = request.user as User;
    const page  = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string ) || 10;

    const followings = await followService.getFollowingsByUserId(user.id, page, limit);
    const followingsDTO = followings.map(following => new UserPreviewDTO(following));

    response.send(followingsDTO);
  };

  public async getUserFollowings(request: Request, response: Response) {
    const userId = request.params.userId as string;
    const page   = parseInt(request.query.page as string) || 1;
    const limit  = parseInt(request.query.limit as string ) || 10;

    const followings = await followService.getFollowingsByUserId(userId, page, limit);
    const followingsDTO = followings.map(following => new UserPreviewDTO(following));

    response.send(followingsDTO);
  }
};

export const followController = new FollowController();