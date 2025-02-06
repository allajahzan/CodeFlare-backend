import { NextFunction, Request, Response } from "express";

/** Interface for Chat Controller */
export interface IChatController {
    getChats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
