import { NextFunction, Request, Response } from "express";

/** Interface for Meet Controller */
export interface IMeetController {
    getMeetById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createMeet(req: Request, res: Response, next: NextFunction): Promise<void>;
}
