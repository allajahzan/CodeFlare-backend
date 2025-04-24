import { NextFunction, Request, Response } from "express";

/** Interface for Attendence Controller */
export interface IAttendenceController {
    checkInOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAttendence(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchAttendence(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadSnapshot(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMonthlyAttendence(req: Request, res: Response, next: NextFunction): Promise<void>;
}
