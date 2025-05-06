import { NextFunction, Request, Response, Router } from "express";
import { WeekController } from "../controller/implementation/weekController";
import { WeekService } from "../service/implementation/weekService";
import { WeekRepository } from "../repository/implementation/weekRepository";
import Week from "../modal/week";

const router = Router();

// Dependency Injection
const weekRepository = new WeekRepository(Week);
const weekService = new WeekService(weekRepository);
const weekController = new WeekController(weekService);

// Get weeks
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    weekController.getWeeks(req, res, next)
);

// Add week
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    weekController.addWeek(req, res, next)
);

// Update week
router.put("/:weekId", (req: Request, res: Response, next: NextFunction) =>
    weekController.updateWeek(req, res, next)
);

// Search weeks
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
    weekController.searchWeeks(req, res, next)
);

export { router as weekRoute };
