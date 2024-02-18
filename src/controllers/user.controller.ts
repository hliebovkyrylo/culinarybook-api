import { 
  type Request, 
  type Response 
}                     from "express";
import { ProfileDTO, UserPreviewDTO } from "../dtos/user.dto";
import { User }       from "@prisma/client";
import { userService } from "../services/user.service";

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
};

export const userController = new UserController();