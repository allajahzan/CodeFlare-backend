import { Request, Response, NextFunction } from "express";

/** Interface for Warning Controller */
export interface IWarningController {
    getWarnings(req: Request, res: Response, next: NextFunction) : Promise<void>;
    createWarning(req: Request, res: Response, next: NextFunction) : Promise<void>;
    replyToWarning(req: Request, res: Response, next: NextFunction) : Promise<void>;
}