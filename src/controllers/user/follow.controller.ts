import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { followService }               from "../../services/user/follow.service";
import { notificationService }         from "../../services/user/notification.service";
import { UserFollowPreviewDTO, UserPreviewDTO }              from "../../dtos/user.dto";
import { userService }                 from "../../services/user/user.service";

class FollowController {
  public async follow(request: Request, response: Response) {
    const user            = request.user as User;
    const requestedUserId = request.params.userId as string;

    const requestedUser = await userService.getUserById(requestedUserId);

    const isFollowed = await followService.isAlreadyFollowed(requestedUserId, user.id);

    if (user.id.toString() === requestedUserId) {
      return response.status(409).send({
        code   : "cant-follow",
        message: "You can't follow your account!"
      });
    }

    if (requestedUser === null) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!",
      });
    }

    if (isFollowed !== null) {
      return response.status(409).send({
        code   : "you-already-followed",
        message: "You already followed to this user!"
      });
    }

    const isUserPrivate = requestedUser.isPrivate;

    const notificationType = isUserPrivate ? "follow-request" : "follow";

    if (isUserPrivate) {
      const followRequest = await followService.getFollowRequestByIds(user.id, requestedUserId);

      if (followRequest) {
        return response.status(409).send({
          code   : "already-sent",
          message: "Follow request has already been sent!"
        });
      }

      await followService.createFollowRequest({ requesterId: user.id, requestedId: requestedUserId });
      await notificationService.craeteNotification({ userId: requestedUserId, noficitaionCreatorId: user.id, type: notificationType, noficationData: "", recipeId: "", createdAt: new Date })
    } else {
      await followService.createFollow({ followerId: user.id, userId: requestedUserId });
      await notificationService.craeteNotification({ userId: requestedUserId, noficitaionCreatorId: user.id, type: notificationType, noficationData: "", recipeId: "", createdAt: new Date })
    }

    const message = isUserPrivate
      ? "Your follow request has been sent!"
      : "You are now following the user!";
    
    response.send({ message: message });
  };

  public async requestFollow(request: Request, response: Response) {
    const user       = request.user as User;
    const followerId = request.params.userId;
    const data       = request.body.allowed as boolean;

    const followRequest = await followService.getFollowRequestByIds(followerId, user.id);

    if (followRequest === null) {
      return response.status(404).send({
        code   : "follow-request-not-found",
        message: "Follow request not found!",
      });
    }

    if (data) {
      await followService.createFollow({ followerId: followerId, userId: user.id });

      await notificationService.craeteNotification({ userId: followerId, noficitaionCreatorId: user.id, type: "follow-allowed", noficationData: "", recipeId: "", createdAt: new Date });
    } 

    await followService.deleteFollowRequestById(followRequest.id);
    const followRequestNotification = await notificationService.getFollowNotification(followerId, user.id, "follow-request");
    followRequestNotification && await notificationService.deleteNotification(followRequestNotification.id);

    const message = data 
      ? "Follow allowed!"
      : "Follow rejected!"

    response.send({ message: message });
  };

  public async cancelFollowRequest(request: Request, response: Response) {
    const user            = request.user as User;
    const requestedUserId = request.params.userId;

    const followRequest = await followService.getFollowRequestByIds(user.id, requestedUserId);

    if (followRequest === null) {
      return response.status(404).send({
        code   : "request-not-found",
        message: "Follow request not found!",
      });
    }

    await followService.deleteFollowRequestById(followRequest.id);
    response.send({ message: "Follow request canceled!" });
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

    const followRequestNotification = await notificationService.getFollowNotification(followUser, user.id, "follow-request");
    followRequestNotification && await notificationService.deleteNotification(followRequestNotification.id);

    response.send({ message: "You unfollowing!" });
  };

  public async getMyFollowers(request: Request, response: Response) {
    const user  = request.user as User;
    const page  = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string ) || 10;

    const followers = await followService.getUserFollowers(user.id, page, limit);
    const followersDTO = followers.map(follower => new UserFollowPreviewDTO(follower));

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
    const followersDTO = followers.map(follower => new UserFollowPreviewDTO(follower));

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
    const followingsDTO = followings.map(following => new UserFollowPreviewDTO(following));

    response.send(followingsDTO);
  };

  public async getUserFollowings(request: Request, response: Response) {
    const userId = request.params.userId as string;
    const page   = parseInt(request.query.page as string) || 1;
    const limit  = parseInt(request.query.limit as string ) || 10;

    const followings = await followService.getFollowingsByUserId(userId, page, limit);
    const followingsDTO = followings.map(following => new UserFollowPreviewDTO(following));

    response.send(followingsDTO);
  }

  public async getFollowState(request: Request, response: Response) {
    const follower = request.user as User;
    const userId   = request.params.userId;

    const follow = await followService.isAlreadyFollowed(userId, follower.id);

    response.send({ isFollowed: !!follow });
  }
};

export const followController = new FollowController();