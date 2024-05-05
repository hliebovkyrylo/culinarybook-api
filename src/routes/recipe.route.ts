import {
  CreateRecipeSchema,
  UpdateRecipeSchema
}                             from "../schemas/recipe.schema";
import { Router }             from "express";
import { isAuth }             from "../middleware/isAuth";
import { isVerifiedAccount }  from "../middleware/isVerified";
import { recipeController }   from "../controllers/recipe.controller";
import { validate }           from "../utils/validate";
import { accessToRecipe }     from "../middleware/accessToRecipe";
import { isRecipeOwner }      from "../middleware/isRecipeOwner";
import { isPrivateAccount } from "../middleware/isPrivateAccount";

export const recipeRoute = Router();

recipeRoute.post("/create", isAuth, isVerifiedAccount, validate(CreateRecipeSchema), recipeController.create);
recipeRoute.get("/:recipeId", accessToRecipe, recipeController.getRecipe);
recipeRoute.patch("/:recipeId/update", isAuth, isVerifiedAccount, isRecipeOwner, validate(UpdateRecipeSchema), recipeController.update);
recipeRoute.delete("/:recipeId/delete", isAuth, isVerifiedAccount, isRecipeOwner, recipeController.delete);
recipeRoute.get("/my/liked", isAuth, isVerifiedAccount, recipeController.getLikedRecipes);
recipeRoute.get("/recommended/recipes", isAuth, isVerifiedAccount, recipeController.getRecommendedRecipes);
recipeRoute.get("/my/visited", isAuth, isVerifiedAccount, recipeController.getVisitedRecipes);
recipeRoute.post("/:recipeId/createStep", isAuth, isVerifiedAccount, isRecipeOwner, recipeController.createSteps);
recipeRoute.get("/:recipeId/steps", recipeController.getSteps);
recipeRoute.patch("/update/steps", isAuth, isVerifiedAccount, recipeController.updateSteps);
recipeRoute.delete("/step/delete/:stepId", isAuth, isVerifiedAccount, recipeController.deleteStep);
recipeRoute.get("/saved/get", isAuth, isVerifiedAccount, recipeController.getSavedRecipes);
recipeRoute.get("/popular/recipes", recipeController.getPopularRecipes);
recipeRoute.get("/", recipeController.getRecipesByTitle);
recipeRoute.get("/my/recipes", isAuth, isVerifiedAccount, recipeController.getMyRecipes);
recipeRoute.get("/:userId/recipes", isPrivateAccount, recipeController.getUserRecipes);