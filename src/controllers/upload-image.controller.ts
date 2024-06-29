import { type Request, type Response } from "express";
import { s3 } from "../configs/aws.config";
import { PutObjectCommandInput } from "@aws-sdk/client-s3";

class UploadImageController {
  public async uploadImage(request: Request, response: Response) {
    const file = request.file;

    if (!file) {
      return response.status(400).send({
        code: "no-file",
        message: "No file uploaded!"
      });
    }

    const params: PutObjectCommandInput = {
      Bucket: 'culinarybook-images',
      Key: file.originalname,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype
    };

    await s3.putObject(params);
    response.send({ imageUrl: `https://culinarybook-images.s3.amazonaws.com/${file.originalname}` });
  };
};

export const uploadImageController = new UploadImageController();