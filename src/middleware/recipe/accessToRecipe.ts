import { 
  type Request, 
  type Response, 
  type NextFunction 
}                        from "express";
import { recipeService } from "../../services/recipe.service";
import { verifyToken }   from "../../utils/token";

export const accessToRecipe = async (request: Request, response: Response, next: NextFunction) => {
  let userId: string = "";
  const accessToken  = request.headers.authorization as string;

  if (accessToken) {
    userId = verifyToken(accessToken)
  }

  const recipeId = request.params.recipeId as string;
  const recipe   = await recipeService.getRecipeById(recipeId);

  if (recipe === null) {
    return response.status(404).send({
      code   : "recipe-not-found", 
      message: "This recipe not found!"
    });
  }

  if (recipe.isPublic === false && recipe.ownerId.toString() !== userId) {
    return response.status(403).send({
      code   : "fordbidden",
      message: "You not have access to this recipe!",
    });
  }

  return next();
};