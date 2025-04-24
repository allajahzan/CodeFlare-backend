import { NextFunction, Request, Response, Router } from "express";
import { WarningRepository } from "../repository/implementation/warningRepository";
import { Warning } from "../model/warning";
import { WarningService } from "../service/implementation/warningService";
import { WarningController } from "../controller/implementation/warningController";

const router = Router();

// Dependency Injuction
const attendenceRepository = new WarningRepository(Warning);
const attendenceService = new WarningService(attendenceRepository);
const attendenceController = new WarningController(attendenceService);

// Get warnigs
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.getWarnings(req, res, next)
);

// Create warning
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.createWarning(req, res, next)
);

// Reply to warning
router.patch("/", (req: Request, res: Response, next: NextFunction) =>
    attendenceController.replyToWarning(req, res, next)
);

export { router as warningRouter };
