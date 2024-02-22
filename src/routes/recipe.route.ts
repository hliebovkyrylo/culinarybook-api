import {
  CreateRecipeSchema, 
  UpdateRecipeSchema 
}                             from "../schemas/recipe.schema";
import { Router }             from "express";
import { isAuth }             from "../middleware/auth/isAuth";
import { isVerifiedAccount }  from "../middleware/auth/isVerified";
import { recipeController }   from "../controllers/recipe.controller";
import { validate }           from "../utils/validate";
import { accessToRecipe }     from "../middleware/recipe/accessToRecipe";
import { isRecipeOwner }      from "../middleware/recipe/isRecipeOwner";

export const recipeRoute = Router();

recipeRoute.post("/create", isAuth, isVerifiedAccount, validate(CreateRecipeSchema), recipeController.create);
recipeRoute.get("/:recipeId", accessToRecipe, recipeController.getRecipe);
recipeRoute.patch("/:recipeId/update", isAuth, isVerifiedAccount, isRecipeOwner, validate(UpdateRecipeSchema), recipeController.update);
recipeRoute.delete("/:recipeId/delete", isAuth, isVerifiedAccount, isRecipeOwner, recipeController.delete);
recipeRoute.get("/my/liked", isAuth, isVerifiedAccount, recipeController.getLikedRecipes);