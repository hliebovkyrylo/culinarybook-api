import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { followService }               from "../services/follow.service";

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

    response.send("You unfollowing!");
  };

  public async getMyFollowers(request: Request, response: Response) {
    const user      = request.user as User;
    const followers = await followService.getUserFollowers(user.id);

    response.send(followers);
  };

  public async getNumberUserFollowers(request: Request, response: Response) {
    const user = request.params.userId as string;
    const followers = await followService.getUserFollowers(user);

    response.send(followers);
  };
};

export const followController = new FollowController();