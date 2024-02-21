import { Router }             from "express";
import { isAuth }             from "../middleware/auth/isAuth";
import { isVerifiedAccount }  from "../middleware/auth/isVerified";
import { recipeController }   from "../controllers/recipe.controller";
import { validate }           from "../utils/validate";
import { CreateRecipeSchema } from "../schemas/recipe.schema";
import { isRecipeOwner }      from "../middleware/isRecipeOwner";

export const recipeRoute = Router();

recipeRoute.post("/create", isAuth, isVerifiedAccount, validate(CreateRecipeSchema), recipeController.create);
recipeRoute.get("/:recipeId", isRecipeOwner, recipeController.getRecipe);