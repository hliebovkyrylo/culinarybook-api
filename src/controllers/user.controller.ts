import { 
  type Request, 
  type Response 
}                                     from "express";
import { ProfileDTO, UserPreviewDTO } from "../dtos/user.dto";
import { User }                       from "@prisma/client";
import { userService }                from "../services/user.service";
import { IUpdateUserInfoSchema }      from "../schemas/user.schema";

class UserController {
  public async getMe(request: Request, response: Response) {
    const user       = request.user as User;
    const profileDTO = new ProfileDTO(user);

    response.send({ ...profileDTO });
  };

  public async getUser(request: Request, response: Response) {
    const userId = request.params.userId;
    const user   = await userService.getUserById(userId);

    if (!user) {
      return response.status(404).send({
        code   : "user-not-found",
        message: "User not found!",
      });
    }

    const userDTO = new ProfileDTO(user);
    response.send({ ...userDTO });
  };

  public async searchUserByUsername(request: Request, response: Response) {
    const username = request.query.username as string;
    const users    = await userService.searchUsersByUsername(username);

    response.send(users.map(user => new UserPreviewDTO(user)));
  };

  public async updateUser(request: Request, response: Response) {
    const user                 = request.user as User;
    const data                 = request.body as IUpdateUserInfoSchema;
    const userWithSuchUsername = await userService.getUserByUsername(data.username);

    if (userWithSuchUsername !== null && data.username !== user.username) {
      return response.status(409).send({
        code   : "such-username-exist",
        message: "User with such username is already exist! Please, enter another username.",
      });
    }

    if (data.username === user.username) {
      return response.status(409).send({
        code   : "current-username",
        message: "This is your current username! Please, enter another username if you want to change it."
      });
    }

    const updatedUser = await userService.updateUserInfo(user.id, data);
    const updatedUserDTO = new ProfileDTO(updatedUser);

    response.send({ ...updatedUserDTO });
  };
};

export const userController = new UserController();