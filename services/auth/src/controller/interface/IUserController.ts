import { Request, Response, NextFunction } from "express";

/** Interface for User Controller */
export interface IUserController {
    userLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    userRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
