import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { followService }               from "../services/follow.service";
import { notificationService }         from "../services/notification.service";
import { UserFollowPreviewDTO }        from "../dtos/user.dto";
import { userService }                 from "../services/user.service";
import { verifyToken }                 from "../utils/token";

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
      await notificationService.craeteNotification({ userId: requestedUserId, noficitaionCreatorId: user.id, recipeId: null, type: notificationType, noficationData: "", createdAt: new Date })
    } else {
      await followService.createFollow({ followerId: user.id, userId: requestedUserId });
      await notificationService.craeteNotification({ userId: requestedUserId, noficitaionCreatorId: user.id, recipeId: null, type: notificationType, noficationData: "", createdAt: new Date })
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

      await notificationService.craeteNotification({ userId: followerId, recipeId: null, noficitaionCreatorId: user.id, type: "follow-allowed", noficationData: "", createdAt: new Date });
    } 

    await followService.deleteFollowRequestById(followRequest.id);
    const followRequestNotification = await notificationService.getFollowNotification(followerId, user.id, "follow-request");

    if (followRequestNotification) {
      await notificationService.deleteNotification(followRequestNotification.id);
    }

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

    const followRequestNotification = await notificationService.getFollowNotification(followRequest.requestedId, user.id, "follow-request");

    if (followRequestNotification) {

      await notificationService.deleteNotification(followRequestNotification.id);
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

    if (notification) {
      await notificationService.deleteNotification(notification.id);
    }

    const followRequestNotification = await notificationService.getFollowNotification(followUser, user.id, "follow-request");

    if (followRequestNotification) {
      await notificationService.deleteNotification(followRequestNotification.id);
    }

    response.send({ message: "You unfollowing!" });
  };

  public async getUserFollowers(request: Request, response: Response) {
    const accessToken = request.headers.authorization;
    const userId      = request.params.userId as string;
    const username    = request.query.username as string;

    const existUsername = username !== 'undefined' ? username : '';

    const followers    = await followService.getUserFollowers(userId, existUsername);
    const followersDTO = followers.map(follow => new UserFollowPreviewDTO(follow.follower));

    const followerIds = followersDTO.map(follower => follower.id);

    let followStatus: boolean[];

    if (accessToken) {
      const userMeId = verifyToken(accessToken);
      followStatus = await followService.getFollowStatus(userMeId, followerIds);
    } else {
      followStatus = new Array(followersDTO.length).fill(false);
    }

    const followersWithStatus = followersDTO.map((followerDTO, index) => ({
      ...followerDTO,
      isFollowed: followStatus[index]
    }));

    response.send(followersWithStatus);
  };

  public async getUserFollowings(request: Request, response: Response) {
    const userId   = request.params.userId as string;
    const username = request.query.username as string;

    const existUsername = username !== 'undefined' ? username : '';

    const accessToken = request.headers.authorization;

    const page   = parseInt(request.query.page as string) || 1;
    const limit  = parseInt(request.query.limit as string ) || 10;

    const followings    = await followService.getFollowingsByUserId(userId, existUsername);
    const followingsDTO = followings.map(following => new UserFollowPreviewDTO(following.user));

    const followingsIds = followingsDTO.map(following => following.id);

    let followStatus: boolean[];

    if (accessToken) {
      const userMeId = verifyToken(accessToken);
      followStatus = await followService.getFollowStatus(userMeId, followingsIds);
    } else {
      followStatus = new Array(followingsDTO.length).fill(false);
    }

    const followersWithStatus = followingsDTO.map((followerDTO, index) => ({
      ...followerDTO,
      isFollowed: followStatus[index]
    }));

    response.send(followersWithStatus);
  }

  public async getFollowState(request: Request, response: Response) {
    const follower = request.user as User;
    const userId   = request.params.userId;

    const follow = await followService.isAlreadyFollowed(userId, follower.id);

    response.send({ isFollowed: !!follow });
  };

  public async getFollowRequestState(request: Request, response: Response) {
    const userMe      = request.user as User;
    const requestedId = request.params.userId as string;

    const followRequest = await followService.getFollowRequestByIds(userMe.id, requestedId);

    response.send({ isFollowRequestSent: !!followRequest });
  }
};

export const followController = new FollowController();