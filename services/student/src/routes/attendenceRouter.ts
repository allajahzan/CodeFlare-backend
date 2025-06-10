import { NextFunction, Request, Response, Router } from "express";
import { AttendenceRepository } from "../repository/implementation/attendenceRepository";
import Attendence from "../model/attendence";
import { AttendenceService } from "../service/implementation/attendenceService";
import { AttendenceController } from "../controller/implementation/attendenceController";

const router = Router();

// Dependency Injuction
const attendenceRepository = new AttendenceRepository(Attendence);
const attendenceService = new AttendenceService(attendenceRepository);
const attendenceController = new AttendenceController(attendenceService);

// Get Attendence
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.getAttendence(req, res, next)
);

// CheckInOut
router.patch("/check-in-out", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.checkInOut(req, res, next)
);

// Search Attendences
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.searchAttendence(req, res, next)
);

// Approval CheckIn
router.patch("/approval/:attendanceId", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.approvalCheckIn(req, res, next)
);

// Upload Snapshot
router.post("/snapshot/:userId", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.uploadSnapshot(req, res, next)
);

// Update Status
router.patch("/status/:attendenceId", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.updateStatus(req, res, next)
);

// Get Monthly Attendence
router.get("/monthly-attendence", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.getMonthlyAttendence(req, res, next)
);

export { router as attendenceRouter };
