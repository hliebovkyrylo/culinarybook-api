import { Router }            from "express";
import { isAuth }            from "../middleware/isAuth";
import { isVerifiedAccount } from "../middleware/isVerified";
import { saveController }    from "../controllers/save.controller";
import { accessToRecipe }    from "../middleware/accessToRecipe";

export const saveRoute = Router();

saveRoute.post("/create/:recipeId", isAuth, isVerifiedAccount, accessToRecipe, saveController.save);
saveRoute.delete("/delete/:recipeId", isAuth, isVerifiedAccount, saveController.removeSave);
saveRoute.get("/recipe/:recipeId/isSaved", isAuth, isVerifiedAccount, saveController.getSaveState);