import { 
  type Request, 
  type Response 
}                                     from "express";
import { ProfileDTO, UserPreviewDTO } from "../../dtos/user.dto";
import { Recipe, User }               from "@prisma/client";
import { userService }                from "../../services/user/user.service";
import { IUpdateUserInfoSchema }      from "../../schemas/user.schema";
import { recipeService }              from "../../services/recipe/recipe.service";
import { followService } from "../../services/user/follow.service";
import { likeService } from "../../services/recipe/like.service";

class UserController {
  public async getMe(request: Request, response: Response) {
    const user       = request.user as User;
    const profileDTO = new ProfileDTO(user);

    response.send({ ...profileDTO });
  };

  public async getUser(request: Request, response: Response) {
    const userId = request.params.userId;
    const user   = await userService.getUserById(userId);

    if (!user) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!",
      });
    }

    const userDTO = new ProfileDTO(user);
    response.send({ ...userDTO });
  };

  public async searchUserByUsername(request: Request, response: Response) {
    const username = request.query.username as string;
    const page     = parseInt(request.query.page as string) || 1;
    const limit    = parseInt(request.query.limit as string ) || 10;

    const users = await userService.searchUsersByUsername(username, page, limit);

    response.send(users.map(user => new UserPreviewDTO(user)));
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

    if (data.username === user.username) {
      return response.status(409).send({
        code   : "current-username",
        message: "This is your current username! Please, enter another username if you want to change it."
      });
    }

    const updatedUser = await userService.updateUserInfo(user.id, data);
    const updatedUserDTO = new ProfileDTO(updatedUser);

    response.send({ ...updatedUserDTO });
  };

  public async updateAccountType(request: Request, response: Response) {
    const user = request.user as User;
    await userService.changeAccountType(user.id, user.isPrivate);

    response.send("Account type changed!");
  }

  public async getRecommendedUsers(request: Request, response: Response) {
    const user = request.user as User;
  
    const likedRecipes   = await recipeService.getAllLikedRecipesByUserId(user.id);
    const savedRecipes   = await recipeService.getAllSavedRecipesByUserId(user.id);
    const visitedRecipes = await recipeService.getAllVisitedRecipesByUserId(user.id);
    const userRecipes    = likedRecipes.concat(savedRecipes, visitedRecipes);

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
    const users    = await userService.getAllUsers();

    if (keywords.length === 0) {
      const userLikesAndFollowers = await Promise.all(users.map(async (user) => {
        const recipes    = await recipeService.getRecipesByUserId(user.id);
        const likes      = await likeService.getLikesByRecipseIds(recipes.map(recipe => recipe.id))
        const followers  = await followService.getAllFollowersByUserId(user.id);

        const totalLikes = likes.length;
        const followerWeight = 2;
        
        return { user, ratio: (followers.length * followerWeight) / totalLikes };
      }));
      
      userLikesAndFollowers.sort((a, b) => b.ratio - a.ratio);
      
      response.send(userLikesAndFollowers.map(user => new UserPreviewDTO(user.user)));
    }
  
    const userRecipesWithDetails = await Promise.all(users.map(async (user) => {
      const recipes = await recipeService.getRecipesByUserId(user.id);
      return { user, recipes };
    }));

    function checkKeywords(recipe: Recipe, keywords: string[]) {
      return keywords.some(keyword => recipe.title.includes(keyword));
    }
    
    const interestedUsers = userRecipesWithDetails
    .map(({ user, recipes }) => {
      const containsKeywords = recipes.some(recipe => checkKeywords(recipe, keywords));
      return { user, containsKeywords };
    })
    .filter(({ user, containsKeywords }) => {
      const shouldInclude = user.id !== request.user?.id && containsKeywords;
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
  
    response.send(interestedUsers.map(user => new UserPreviewDTO(user.user)));
  };
};

export const userController = new UserController();