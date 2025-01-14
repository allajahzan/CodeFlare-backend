import { NextFunction, Request } from "express";
import { IUserLoginResponse } from "../../dto/userService/IUserLoginDto";

/** Interface for User Controller */
export interface IUserController {
    userLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    userRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
