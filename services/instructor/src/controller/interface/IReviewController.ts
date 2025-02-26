import { NextFunction, Request, Response } from "express";

/** Interface for Review Controller */
export interface IReviewController {
    getScheduledReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    scheduleReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
}