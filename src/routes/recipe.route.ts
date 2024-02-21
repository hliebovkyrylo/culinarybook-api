import { Router }             from "express";
import { isAuth }             from "../middleware/auth/isAuth";
import { isVerifiedAccount }  from "../middleware/auth/isVerified";
import { recipeController }   from "../controllers/recipe.controller";
import { validate }           from "../utils/validate";
import { CreateRecipeSchema, UpdateRecipeSchema } from "../schemas/recipe.schema";
import { accessToRecipe }     from "../middleware/accessToRecipe";

export const recipeRoute = Router();

recipeRoute.post("/create", isAuth, isVerifiedAccount, validate(CreateRecipeSchema), recipeController.create);
recipeRoute.get("/:recipeId", accessToRecipe, recipeController.getRecipe);
recipeRoute.patch("/:recipeId/update", isAuth, isVerifiedAccount, validate(UpdateRecipeSchema), recipeController.update);