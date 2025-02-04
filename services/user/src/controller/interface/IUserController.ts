import { Request, Response, NextFunction } from "express";

/** Interface for User Controller */
export interface IUserController {
    // Authentication related methods
    userLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    userRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
    userVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkResetPasswordLink(req: Request, res: Response, next: NextFunction): Promise<void>;
    userResetPassword(req: Request, res: Response, next: NextFunction) : Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    userLogout(req: Request, res:Response, next: NextFunction) : Promise<void>;

    // User CRUD related methods
    getUser(req: Request, res:Response, next: NextFunction) : Promise<void>
    getUsers(req: Request, res:Response, next: NextFunction) : Promise<void>
    createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    changeUserStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
