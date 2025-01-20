import { Request, Response, NextFunction } from "express";

/** Interface for User Controller */
export interface IUserController {
    userLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    userRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
    userVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    userVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
