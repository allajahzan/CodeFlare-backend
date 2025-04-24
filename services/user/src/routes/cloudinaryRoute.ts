import { NextFunction, Request, Response, Router } from "express";
import { CloudinaryService } from "../service/implementation/cloudinaryService";
import { CloudinaryController } from "../controller/implementation/cloudinaryController";

const router = Router();

// Dependency Injuction
const cloudinaryService = new CloudinaryService();
const cloudinaryController = new CloudinaryController(cloudinaryService);

// Delete image 
router.delete('/delete-image', (req: Request, res: Response, next: NextFunction) =>
    cloudinaryController.deleteImage(req, res, next)
)

export { router as cloudinaryRoute }