import { NextFunction, Request, Response } from "express";

/** Interface for Profile Controller */
export interface IProfileController {
    getProfileByUserId(req: Request, res: Response, next: NextFunction): Promise<void>
    updateProfileByUserId(req: Request, res: Response, next: NextFunction): Promise<void>
    changeProfilePic(req: Request, res: Response, next: NextFunction): Promise<void>
    changePassword(req: Request, res: Response, next: NextFunction): Promise<void>
}