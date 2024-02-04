import { 
  type Request,
  type Response,
  type NextFunction,
} from "express";

export default async (
  error   : Error,
  request : Request,
  response: Response,
  next    : NextFunction,
) => {
  console.log(error);
  response.status(500).send({
    code: 'internal',
    error: 'Internal server error!'
  });
};