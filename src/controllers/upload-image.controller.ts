import fs                              from "fs";
import { type Request, type Response } from "express";
import multer                          from "multer";

const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    const uploadFolder = 'uploads';
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }
    callback(null, uploadFolder);
  },
  filename: (_, file, callback) => {
    const filename = file.originalname.replace(/\s/g, '_');
    callback(null, filename);
  }
});

const upload = multer({ storage });

class UploadImageController {
  public uploadImage(request: Request, response: Response) {
    upload.single('image')(request, response, (err) => {
      if (err) {
        console.error(err);
        return response.status(400).send({ code: "error-upload-file", message: "Error uploading file!" });
      }
      if (!request.file) {
        return response.status(400).send({ code: "no-file", message: "No file uploaded!" });
      }
      response.send({ imageUrl: `uploads/${request.file.filename}` });
    });
  };
};

export const uploadImageController = new UploadImageController();