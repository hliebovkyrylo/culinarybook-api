import { Recipe } from "@prisma/client";

export type IPreviewRecipeDTO = Omit<Recipe, "ingradients" | "isPublic" | "ownerId">;

export class RecipePreviewDTO implements IPreviewRecipeDTO {
  public id          : string;
  public title       : string;
  public image       : string;
  public coockingTime: string;
  public complexity  : string;
  public typeOfFood  : string;

  constructor (data: IPreviewRecipeDTO) {
    this.id           = data.id,
    this.title        = data.title,
    this.image        = data.image,
    this.coockingTime = data.coockingTime,
    this.complexity   = data.complexity,
    this.typeOfFood   = data.typeOfFood
  };
};