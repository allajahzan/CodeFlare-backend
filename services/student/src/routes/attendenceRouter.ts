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

// Get Attendence
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.getAttendence(req, res, next)
);

// Searrch Attendences
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.searchAttendence(req, res, next)
);

// CheckInOut
router.patch("/check-in-out", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.checkInOut(req, res, next)
);

// Upload Snapshot
router.post("/upload-snapshot/:userId", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.uploadSnapshot(req, res, next)
);

// Update status
router.patch("/update-status/:attendenceId", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.updateStatus(req, res, next)
);

export { router as attendenceRouter };
