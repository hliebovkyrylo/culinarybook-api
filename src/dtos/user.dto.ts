import { type User } from "@prisma/client";

export type IUserDTO = Omit<User, "password">;

export type IUserPreviewDTO = Omit<User, "password" | "isVerified" | "canResetPassword" | "email" | "isPrivate"> & {
  followerCount: number;
  recipeCount  : number;
};

export type IUserFollowPreviewDTO = Omit<User, "password" | "isVerified" | "canResetPassword" | "email" | "isPrivate">;

export class ProfileDTO implements IUserDTO {
  public id              : string;
  public email           : string;
  public username        : string;
  public name            : string;
  public image           : string;
  public backgroundImage : string;
  public isVerified      : boolean;
  public canResetPassword: boolean;
  public isPrivate       : boolean;

  constructor(data: IUserDTO) {
    this.id               = data.id,
    this.email            = data.email,
    this.username         = data.username,
    this.name             = data.name,
    this.image            = data.image,
    this.backgroundImage  = data.backgroundImage,
    this.isVerified       = data.isVerified,
    this.canResetPassword = data.canResetPassword
    this.isPrivate        = data.isPrivate
  }
}

export class UserPreviewDTO implements IUserPreviewDTO {
  public id: string;
  public username: string;
  public name: string;
  public image: string;
  public backgroundImage: string;
  public followerCount: number;
  public recipeCount: number;

  constructor(data: IUserPreviewDTO) {
    this.id = data.id,
    this.username = data.username,
    this.name = data.name,
    this.image = data.image,
    this.backgroundImage = data.backgroundImage
    this.followerCount = data.followerCount;
    this.recipeCount = data.recipeCount;
  }
}

export class UserFollowPreviewDTO implements IUserFollowPreviewDTO {
  public id: string;
  public username: string;
  public name: string;
  public image: string;
  public backgroundImage: string;

  constructor(data: IUserFollowPreviewDTO) {
    this.id = data.id,
    this.username = data.username,
    this.name = data.name,
    this.image = data.image,
    this.backgroundImage = data.backgroundImage
  }
}