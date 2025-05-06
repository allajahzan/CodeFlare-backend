import { NextFunction, Request, Response } from "express";

/** Interface for Week Controller */
export interface IWeekController {
    getWeeks(req: Request, res: Response, next: NextFunction): Promise<void>;
    addWeek(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateWeek(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchWeeks(req: Request, res: Response, next: NextFunction): Promise<void>;
}
