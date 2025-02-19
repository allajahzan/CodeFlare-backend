import { NextFunction, Request, Response } from "express";

/** Interface for Batch Controller */
export interface IBatchController {
    getBatches(req: Request, res: Response, next: NextFunction): Promise<void>;
    addBatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateBatch(req: Request, res: Response, next: NextFunction): Promise<void>;
}
