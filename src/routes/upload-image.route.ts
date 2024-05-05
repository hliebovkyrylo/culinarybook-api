import { Router }                from "express";
import { isAuth }                from "../middleware/isAuth";
import { isVerifiedAccount }     from "../middleware/isVerified";
import { uploadImageController } from "../controllers/upload-image.controller";

export const uploadImageRoute = Router();

uploadImageRoute.post('/image', isAuth, isVerifiedAccount, uploadImageController.uploadImage);