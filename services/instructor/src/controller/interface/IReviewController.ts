import { NextFunction, Request, Response } from "express";

/** Interface for Review Controller */
export interface IReviewController {
    scheduleReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
}