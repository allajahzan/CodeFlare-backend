import { NextFunction, Request, Response } from "express";

/** Interface for Message Controller */
export interface IMessageController {
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
}
