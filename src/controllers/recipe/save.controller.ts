import { type Request, type Response } from "express";
import { User }                        from "@prisma/client";
import { saveService }                 from "../../services/recipe/save.service";
import { recipeService }               from "../../services/recipe/recipe.service";
import { notificationService }         from "../../services/user/notification.service";

class SaveController {
  public async save(request: Request, response: Response) {
    const user     = request.user as User;
    const recipeId = request.params.recipeId as string;

    const recipe = await recipeService.getRecipeById(recipeId);

    if (recipe === null) {
      return response.status(404).send({
        code   : "recipe-not-found",
        message: "Recipe not found!",
      });
    }

    const isAlreadySaved = await saveService.getSavedByIds({ userId: user.id, recipeId: recipeId });

    if (isAlreadySaved) {
      return response.status(409).send({
        code   : "already-saved",
        message: "You alredy save this recipe!",
      });
    }

    await saveService.createSave({ userId: user.id, recipeId: recipeId });

    if (user.id !== recipe.ownerId) {
      await notificationService.craeteNotification({ userId: recipe.ownerId, noficitaionCreatorId: user.id, type: "save", noficationData: "", recipeId: recipe.id, createdAt: new Date })
    }

    response.send("Saved!");
  };

  public async removeSave(request: Request, response: Response) {
    const user = request.user as User;
    const recipeId = request.params.recipeId as string;

    const save = await saveService.getSavedByIds({ userId: user.id, recipeId: recipeId });

    if (save === null) {
      return response.status(404).send({
        code   : "saved-recipe-not-found",
        message: "Saved recipe not found!",
      });
    }

    if (save.userId !== user.id) {
      return response.status(403).send({
        code   : "not-have-access",
        message: "You not have access to change it!",
      });
    }

    await saveService.removeSave({ userId: user.id, recipeId: recipeId });
    response.send("Removed from saved!");
  };
};

export const saveController = new SaveController();