import { Router }                from "express";
import { isAuth }                from "../middleware/isAuth";
import { isVerifiedAccount }     from "../middleware/isVerified";
import { uploadImageController } from "../controllers/upload-image.controller";
import multer                    from "multer";

export const uploadImageRoute = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

uploadImageRoute.post('/image', isAuth, isVerifiedAccount, upload.single('image'), uploadImageController.uploadImage);