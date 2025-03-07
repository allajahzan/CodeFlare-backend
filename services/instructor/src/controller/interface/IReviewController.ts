import { NextFunction, Request, Response } from "express";

/** Interface for Review Controller */
export interface IReviewController {
    getScheduledReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    scheduleReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    changeStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateScore(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
}