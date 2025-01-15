import { NextFunction, Request, Response } from "express";

/** Interface for User Controller */
export interface IUserController {
    getUsers(req:Request, res:Response, next:NextFunction): Promise<void>
    createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    changeUserStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
}
