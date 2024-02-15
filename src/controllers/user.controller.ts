import { 
  type Request, 
  type Response 
}                     from "express";
import { ProfileDTO } from "../dtos/user.dto";
import { User }       from "@prisma/client";

class UserController {
  public async getMe(request: Request, response: Response) {
    const user       = request.user as User;
    const profileDTO = new ProfileDTO(user);

    response.send({ ...profileDTO });
  };
};

export const userController = new UserController();