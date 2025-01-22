import { Request, Response, NextFunction } from "express";

/** Interface for User Controller */
export interface IUserController {
    userLogin(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    userRegister(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    userVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    userVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    userResetPassword(req: Request, res: Response, next: NextFunction) : Promise<Response | void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getUser(req: Request, res:Response, next: NextFunction) : Promise<Response | void>
    getCoordinatorsAndInstructors(req: Request, res: Response, next: NextFunction) : Promise<Response | void>;
    getStudents(req: Request, res:Response, next: NextFunction) : Promise<Response | void>
    createUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    changeUserStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
