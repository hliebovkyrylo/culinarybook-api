import { 
  type Request, 
  type Response 
}                                     from "express";
import { ProfileDTO, UserPreviewDTO } from "../dtos/user.dto";
import { Recipe, User }               from "@prisma/client";
import { userService }                from "../services/user.service";
import { IUpdateUserInfoSchema }      from "../schemas/user.schema";
import { recipeService }              from "../services/recipe.service";
import { followService }              from "../services/follow.service";
import { likeService }                from "../services/like.service";
import { notificationService }        from "../services/notification.service";
import { s3 } from "../configs/aws.config";
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';

class UserController {
  public async getMe(request: Request, response: Response) {
    const user       = request.user as User;
    const profileDTO = new ProfileDTO(user);

    response.send({ ...profileDTO });
  };

  public async getUser(request: Request, response: Response) {
    const userId      = request.params.userId;

    const user = await userService.getUserById(userId);

    if (!user) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!",
      });
    }

    const userDTO = new ProfileDTO(user);

    const [userFollowers, userFollowings, userRecipes] = await Promise.all([
      followService.getAllFollowersByUserId(userId),
      followService.getAllFollowingsByUserId(userId),
      recipeService.getRecipesByUserId(userId)
    ]);
    
    response.send({ 
      ...userDTO,
      followersCount : userFollowers.length,
      followingsCount: userFollowings.length,  
      recipesCount   : userRecipes.length
    });
  };

  public async updateUser(request: Request, response: Response) {
    const user                 = request.user as User;
    const data                 = request.body as IUpdateUserInfoSchema;
    const userWithSuchUsername = await userService.getUserByUsername(data.username);

    if (userWithSuchUsername !== null && data.username !== user.username) {
      return response.status(409).send({
        code   : "such-username-exist",
        message: "User with such username is already exist! Please, enter another username.",
      });
    }

    if (data.image !== '' || data.backgroundImage !== '') {
      const objectsToDelete = [];

      if (data.image !== '' && user.image !== '') {
        objectsToDelete.push({ Key: (user.image).split("/").pop() });
      }

      if (data.backgroundImage !== '' && user.backgroundImage !== '') {
        objectsToDelete.push({ Key: (user.backgroundImage).split("/").pop() });
      }

      if (objectsToDelete.length > 0) {
        const params = {
          Bucket: 'culinarybook-images',
          Delete: {
            Objects: objectsToDelete
          }
        };

        const command = new DeleteObjectsCommand(params);
        await s3.send(command);
      }
    }

    const updatedUser    = await userService.updateUserInfo(user.id, data);
    const updatedUserDTO = new ProfileDTO(updatedUser);

    if (updatedUserDTO.isPrivate === false) {
      const followRequests = await followService.getFollowRequestsByUserId(user.id);
  
      if (followRequests) {
        for (let request of followRequests) {
          await followService.createFollow({
            userId    : request.requestedId,
            followerId: request.requesterId
          });

          const followRequestNotification = await notificationService.getFollowNotification(request.requesterId, user.id, "follow-request");

          if (followRequestNotification) {
            await notificationService.deleteNotification(followRequestNotification.id);
          }
        }
      }
    }
  
    response.send({ ...updatedUserDTO });
  };

  public async updateAccountType(request: Request, response: Response) {
    const user = request.user as User;
    await userService.changeAccountType(user.id, user.isPrivate);

    response.send({ message: "Account type changed!" });
  }

  public async getRecommendedUsers(request: Request, response: Response) {
    const user     = request.user as User;
    const page     = parseInt(request.query.page as string) || 1;
    const limit    = parseInt(request.query.limit as string) || 10;
    const username = request.query.username as string;

    const [likedRecipes, savedRecipes, visitedRecipes, users] = await Promise.all([
      recipeService.getAllLikedRecipesByUserId(user.id),
      recipeService.getAllSavedRecipesByUserId(user.id),
      recipeService.getAllVisitedRecipesByUserId(user.id),
      userService.getAllUsers(username !== 'undefined' ? username : undefined)
    ]);

    const userRecipes = likedRecipes.concat(savedRecipes, visitedRecipes);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
  
    async function getKeywordsFromRecipes(recipes: Recipe[]) {
      const recipeWords: string[] = recipes.flatMap(recipe => recipe.title.split(' '));
  
      if (recipeWords.length === 0) {
        return [];
      }
  
      const wordFrequency = new Map<string, number>();
      recipeWords.forEach(word => {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      });
  
      const keywords = Array.from(wordFrequency.entries())
        .filter(([word, count]) => count > 1)
        .map(([word, count]) => word);
  
      return keywords;
    }
  
    const keywords = await getKeywordsFromRecipes(userRecipes);
  
    let paginatedUsers = [];
  
    if (keywords.length === 0) {
      const userLikesAndFollowers = await Promise.all(
        users.map(async (user) => {
          const recipes = await recipeService.getRecipesByUserId(user.id);
          const likes = await likeService.getLikesByRecipseIds(recipes.map(recipe => recipe.id))
          const followers = await followService.getAllFollowersByUserId(user.id);
  
          const totalLikes = likes.length;
          const followerWeight = 2;
  
          return { user, ratio: (followers.length * followerWeight) / totalLikes };
        })
      );
  
      userLikesAndFollowers.sort((a, b) => b.ratio - a.ratio);
  
      const usersPreviewDTO = userLikesAndFollowers.map((user) => new UserPreviewDTO(user.user));
      paginatedUsers = usersPreviewDTO.slice(startIndex, endIndex);
      return response.send(paginatedUsers);
    }
  
    const userRecipesWithDetails = await Promise.all(
      users.map(async (user) => {
        const recipes = await recipeService.getRecipesByUserId(user.id);
        return { user, recipes };
      })
    );
  
    function checkKeywords(recipe: Recipe, keywords: string[]) {
      return keywords.some(keyword => recipe.title.includes(keyword));
    }
  
    const interestedUsers = userRecipesWithDetails
      .map(({ user, recipes }) => {
        const containsKeywords = recipes.some(recipe => checkKeywords(recipe, keywords));
        return { user, containsKeywords };
      })
      .filter(({ user, containsKeywords }) => {
        const currentUser = request.user as User;
        const shouldInclude = user.id !== currentUser.id && containsKeywords;
        return shouldInclude;
      });
  
    interestedUsers.sort((a, b) => {
      if (a.containsKeywords && !b.containsKeywords) {
        return -1;
      } else if (!a.containsKeywords && b.containsKeywords) {
        return 1;
      } else {
        return 0;
      }
    });
  
    paginatedUsers = interestedUsers.slice(startIndex, endIndex).map((user) => new UserPreviewDTO(user.user));
  
    response.send(paginatedUsers);
  }

  public async getPopularUsers(request: Request, response: Response) {
    const page     = parseInt(request.query.page as string) || 1;
    const limit    = parseInt(request.query.limit as string) || 10;
    const username = request.query.username as string;
    const users    = await userService.getAllUsers(username !== 'undefined' ? username : undefined);

    const userFollowersAndLikes = await Promise.all(users.map(async user => {
      const recipes   = await recipeService.getRecipesByUserId(user.id);
      const likes     = await likeService.getLikesByRecipseIds(recipes.map(recipe => recipe.id));
      const followers = await followService.getAllFollowersByUserId(user.id);

      const totalLikes     = likes.length;
      const followerWeight = 2;

      return { user, ratio: (followerWeight * followers.length) / totalLikes }
    }));

    const startIndex = (page - 1) * limit;
    const endIndex   = startIndex + limit;

    userFollowersAndLikes.sort((a, b) => b.ratio - a.ratio);

    const paginatedUsers = userFollowersAndLikes.slice(startIndex, endIndex);
    response.send(paginatedUsers.map(user => new UserPreviewDTO(user.user)));
  };

  public async getAllUsersIds(_request: Request, response: Response) {
    const usersIds = await userService.getAllUsersIds();

    response.send({ usersIds: usersIds });
  };
};

export const userController = new UserController();