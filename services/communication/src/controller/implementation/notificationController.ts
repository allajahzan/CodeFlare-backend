import { Request, Response, NextFunction } from "express";
import { INotificationService } from "../../service/interface/INotificationService";
import { INotificationController } from "../interface/INotificationController";
import { ResponseMessage, SendResponse } from "@codeflare/common";
import { HttpStatusCode } from "axios";

/** Implementaion of Notification Controller */
export class NotificationController implements INotificationController {
    private notificationService: INotificationService;

    constructor(notificationService: INotificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Retrieves the list of notifications for a user with the given recieverId.
     * @param req - The express request object containing the recieverId in the request query.
     * @param res - The express response object used to send the list of notifications.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the notification list retrieval process is complete.
     */
    async getNotifications(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { receiverId, limit, skip } = req.query;

            const data = await this.notificationService.getNotifications(
                receiverId as string,
                Number(limit),
                Number(skip)
            );

            SendResponse(res, HttpStatusCode.Ok, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Creates a new notification in the system.
     * @param req - The express request object containing the notification data in the request body.
     * @param res - The express response object used to send the newly created notification object.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the notification creation process is complete.
     * @throws Passes any errors to the next middleware.
     */
    async createNotification(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { notification } = req.body;

            const data = await this.notificationService.createNotification(
                notification
            );

            SendResponse(res, HttpStatusCode.Ok, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates a notification in the system.
     * @param req - The express request object containing the notification id in the request parameters.
     * @param res - The express response object used to send the updated notification object.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the notification update process is complete.
     * @throws Passes any errors to the next middleware.
     */
    async updateNotification(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { notificationId } = req.params;

            const data = await this.notificationService.updateNotification(
                notificationId as string
            );

            SendResponse(res, HttpStatusCode.Ok, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates all unread notifications for a specific user to mark them as read.
     * @param req - The express request object containing the receiver's ID in the request parameters.
     * @param res - The express response object used to send the success response.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the notifications update process is complete.
     * @throws Passes any errors to the next middleware.
     */
    async updateAllNotifications(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { receiverId } = req.params;

            await this.notificationService.updateAllNotifications(receiverId);

            SendResponse(res, HttpStatusCode.Ok, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Deletes a notification from the system based on the provided notification ID.
     * @param req - The express request object containing the notification ID in the request query.
     * @param res - The express response object used to send the success response.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the notification deletion process is complete.
     * @throws Passes any errors to the next middleware.
     */
    async deleteNotification(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { notificationId } = req.query;

            await this.notificationService.deleteNotification(
                notificationId as string
            );

            SendResponse(res, HttpStatusCode.Ok, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }
}
