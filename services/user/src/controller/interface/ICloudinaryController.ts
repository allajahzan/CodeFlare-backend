import { NextFunction, Request, Response } from "express";

/** Interface for Cloudinary Controller */
export interface ICloudinaryController {
    // uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>
    deleteImage(req: Request, res: Response, next: NextFunction): Promise<void>
}