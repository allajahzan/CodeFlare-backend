import { Request, Response, NextFunction } from "express";

/** Interface for Notification Controller */
export interface INotificationController {
    getNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    createNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
}