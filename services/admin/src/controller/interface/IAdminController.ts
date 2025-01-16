import { NextFunction, Request, Response } from "express";

/** Interface for Admin Controller */
export interface IAdminController {
    getAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
}
