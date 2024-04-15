import { Router }            from "express";
import { isAuth }            from "../middleware/auth/isAuth";
import { isVerifiedAccount } from "../middleware/auth/isVerified";
import { saveController }    from "../controllers/recipe/save.controller";
import { accessToRecipe }    from "../middleware/recipe/accessToRecipe";

export const saveRoute = Router();

saveRoute.post("/create/:recipeId", isAuth, isVerifiedAccount, accessToRecipe, saveController.save);
saveRoute.delete("/delete/:recipeId", isAuth, isVerifiedAccount, saveController.removeSave);
saveRoute.get("/recipe/:recipeId/isSaved", isAuth, isVerifiedAccount, saveController.getSaveState);