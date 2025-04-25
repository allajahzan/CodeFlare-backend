import { NextFunction, Request, Response, Router } from "express";
import { NotificationController } from "../controller/implementation/notificationController";
import { NotificationService } from "../service/implementation/notificationService";
import { NotificationRepository } from "../repository/implementation/notificationRespository";
import Notification from "../model/notificationSchema";

const router = Router();

// Dependecy Injuction
const notificationRepository = new NotificationRepository(Notification);
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

// Get notifications
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    notificationController.getNotifications(req, res, next)
);

// Create notification
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    notificationController.createNotification(req, res, next)
);

// Update notification
router.patch("/:notificationId", (req: Request, res: Response, next: NextFunction) =>
    notificationController.updateNotification(req, res, next)
);

// Update all notification
router.patch("/all:recieverId", (req: Request, res: Response, next: NextFunction) =>
    notificationController.updateAllNotifications(req, res, next)
);

// Delete notification
router.delete("/", (req: Request, res: Response, next: NextFunction) =>
    notificationController.deleteNotification(req, res, next)
);

export { router as messageRoute };
