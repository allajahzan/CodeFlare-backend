import { NextFunction, Request, Response } from "express";

/** Interface for chat controller */
export interface IChatController {
    send(req: Request, res: Response, next: NextFunction): Promise<void>;
    getChats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
}
