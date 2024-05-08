import { User }                        from "@prisma/client";
import { type Request, type Response } from "express";
import { likeService }                 from "../services/like.service";
import { recipeService }               from "../services/recipe.service";
import { notificationService }         from "../services/notification.service";
import { io }                          from "..";
import { userSockets }                 from "../socket";

class LikeController {
  public async createLike(request: Request, response: Response) {
    const user     = request.user as User;
    const recipeId = request.params.recipeId as string;

    const recipe = await recipeService.getRecipeById(recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found, impossible to like!"
      });
    }

    const alreadyLiked = await likeService.getLikeByIds({ userId: user.id, recipeId: recipeId });

    if (alreadyLiked !== null) {
      return response.status(409).send({
        code   : "recipe-already-liked",
        message: "You alreaddy liked this recipe!"
      });
    }

    await likeService.createlike({ userId: user.id, recipeId: recipeId });
    
    if (user.id !== recipe.ownerId) {
      const notification = await notificationService.craeteNotification({ userId: recipe.ownerId, noficitaionCreatorId: user.id, type: "like", noficationData: "", recipeId: recipe.id, createdAt: new Date })
      
      const recipientSocketId = userSockets[notification.userId];
      io.to(recipientSocketId).emit("notification", notification);
    }

    response.send({ message: "You liked it!" })
  };

  public async removeLike(request: Request, response: Response) {
    const user     = request.user as User;
    const recipeId = request.params.recipeId as string;

    const like = await likeService.getLikeByIds({ userId: user.id, recipeId: recipeId });

    if (like === null) {
      return response.status(404).send({
        code   : "like-not-found",
        message: "Like not found!",
      });
    }

    if (user.id !== like.userId) {
      return response.status(403).send({
        code   : "fordbidden",
        message: "You not have access to change it!"
      });
    }

    await likeService.removeLike({ userId: user.id, recipeId: recipeId });

    const notification = await notificationService.getRecipeNotification(user.id, recipeId, 'like');

    if (notification) {
      const recipientSocketId = userSockets[notification.userId];
      io.to(recipientSocketId).emit("removeNotification", notification.id);

      await notificationService.deleteNotification(notification.id)
    }

    response.send({ message: "Like removed!" });
  };

  public async getRecipeLikes(request: Request, response: Response) {
    const recipeId = request.params.recipeId;
    const likes    = await likeService.getLikesByRecipeId(recipeId);

    response.send(likes);
  };

  public async getLikeState(request: Request, response: Response) {
    const user     = request.user as User;
    const recipeId = request.params.recipeId;

    const recipe = await recipeService.getRecipeById(recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!"
      });
    }

    const like    = await likeService.getLikeByIds({ userId: user.id, recipeId: recipeId });
    const isLiked = !!like;

    response.send({ isLiked });
  }
};

export const likeController = new LikeController();