import { NextFunction, Request, Response, Router } from "express";
import { AttendenceRepository } from "../repository/implementation/attendenceRepository";
import Attendence from "../model/attendence";
import { AttendenceService } from "../service/implementation/attendenceService";
import { AttendenceController } from "../controller/implementation/attendenceController";

const router = Router();

// Dependency injuction
const attendenceRepository = new AttendenceRepository(Attendence);
const attendenceService = new AttendenceService(attendenceRepository);
const attendenceController = new AttendenceController(attendenceService);

// CheckInOut
router.patch("/checkInOut", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.checkInOut(req, res, next)
);

export { router as attendenceRouter };
