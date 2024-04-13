import { Recipe } from "@prisma/client";

export type IPreviewRecipeDTO = Omit<Recipe, "ingradients" | "isPublic">;

export class RecipePreviewDTO implements IPreviewRecipeDTO {
  public id          : string;
  public title       : string;
  public image       : string;
  public coockingTime: string;
  public ownerId     : string;
  public complexity  : string;
  public typeOfFood  : string;
  public createdAt   : Date;

  constructor (data: IPreviewRecipeDTO) {
    this.id           = data.id,
    this.title        = data.title,
    this.image        = data.image,
    this.coockingTime = data.coockingTime,
    this.complexity   = data.complexity,
    this.typeOfFood   = data.typeOfFood
    this.createdAt    = data.createdAt
    this.ownerId      = data.ownerId
  };
};