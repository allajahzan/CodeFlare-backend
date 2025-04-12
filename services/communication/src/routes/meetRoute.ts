import { NextFunction, Request, Response, Router } from "express";
import { MeetController } from "../controller/implementation/meetController";
import { MeetService } from "../service/implementation/meetService";
import { MeetRepository } from "../repository/implementation/meetRepository";
import Meet from "../model/meetSchema";

const router = Router();

// Dependecy Injuction
const meetRepository = new MeetRepository(Meet);
const meetService = new MeetService(meetRepository);
const meetController = new MeetController(meetService);

// Get meet
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    meetController.getMeetById(req, res, next)
);

// Create meet
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    meetController.createMeet(req, res, next)
);

export { router as meetRoute };
