import { Request, Response, NextFunction } from "express";

/** Interface for User Controller */
export interface IUserController {
    userLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    userRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
    userVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    userVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
    userResetPassword(req: Request, res: Response, next: NextFunction) : Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUser(req: Request, res:Response, next: NextFunction) : Promise<void>
    getCoordinatorsAndInstructors(req: Request, res: Response, next: NextFunction) : Promise<void>;
    getStudents(req: Request, res:Response, next: NextFunction) : Promise<void>
    createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    changeUserStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
