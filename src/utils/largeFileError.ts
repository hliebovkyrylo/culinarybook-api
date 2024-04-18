import { Request, Response, NextFunction } from 'express';

export function handleEntityTooLargeError(error: any, request: Request, response: Response, next: NextFunction) {
  if (error.type === 'entity.too.large') {
    response.status(413).send({
      code   : "too-large-image",
      message: "The image is too big! The maximum image size is 1 MB."
    });
  } else {
    next(error);
  }
}
