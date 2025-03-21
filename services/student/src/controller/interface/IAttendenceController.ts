import { NextFunction, Request, Response } from "express";

/** Interface for Attendence Controller */
export interface IAttendenceController {
    checkInOut(req: Request, res: Response, next: NextFunction): Promise<void>;
}
