import { 
  type Request, 
  type Response, 
  type NextFunction 
}                        from "express";
import { User }          from "@prisma/client";
import { recipeService } from "../../services/recipe.service";

export const isRecipeOwner = async (
  request : Request, 
  response: Response, 
  next    : NextFunction
) => {
  const user     = request.user as User;
  const recipeId = request.params.recipeId as string;

  const recipe = await recipeService.getRecipeById(recipeId);

  if (recipe === null) {
    return response.status(404).send({
      code   : "recipe-not-found",
      message: "Recipe not found!",
    });
  }

  if (user.id.toString() !== recipe.ownerId.toString()) {
    return response.status(403).send({
      code   : "fordbidden",
      message: "You have no access to change this recipe!",
    });
  }

  return next();
};