import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { followService } from "../services/follow.service";

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
};

export const followController = new FollowController();