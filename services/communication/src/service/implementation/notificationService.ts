import { BadRequestError } from "@codeflare/common";
import { INotificationSchema } from "../../entities/INotification";
import { INotificationRepository } from "../../repository/interface/INotificationRepository";
import { INotificationService } from "../interface/InotificationService";

/** Implemnetation of Notification Service */
export class NotificationService implements INotificationService {
    private notificationRepository: INotificationRepository;

    /**
     * Constructor for Notification Service
     * @param notificationRepository - Instance of notification repository
     */
    constructor(notificationRepository: INotificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Retrieves the list of notifications for a user with the given recieverId.
     * @param recieverId - The id of the user to retrieve notifications for.
     * @returns A promise that resolves to the list of notifications as INotificationSchema objects or an empty array if no notifications are found.
     * @throws An error if there is a problem retrieving the notifications.
     */
    async getNotifications(recieverId: string): Promise<INotificationSchema[]> {
        try {
            const notifications = await this.notificationRepository.find({
                recieverId,
            });

            if (!notifications || notifications.length === 0) {
                return [];
            }

            return notifications;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Creates a new notification in the system.
     * @param notification - The notification data to be created.
     * @returns A promise that resolves to the newly created notification object.
     * @throws {BadRequestError} If the notification could not be created.
     */
    async createNotification(
        notification: INotificationSchema
    ): Promise<INotificationSchema> {
        try {
            const newNotifaction = await this.notificationRepository.create(
                notification
            );

            if (!newNotifaction)
                throw new BadRequestError("An unexpected error occured !");

            return newNotifaction;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates a notification with the given notificationId to mark it as read.
     * @param notificationId - The id of the notification to be updated.
     * @returns A promise that resolves to the updated notification object.
     * @throws {BadRequestError} If the notification could not be updated.
     */
    async updateNotification(
        notificationId: string
    ): Promise<INotificationSchema> {
        try {
            const updatedNotification = await this.notificationRepository.update(
                { _id: notificationId },
                { $set: { isRead: true } }
            );

            if (!updatedNotification)
                throw new BadRequestError("An unexpected error occured !");

            return updatedNotification;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates all unread notifications in the database to mark them as read.
     * @param recieverId - The id of the user to update the notifications for.
     * @returns A promise that resolves to null if the update operation was successful, otherwise rejects with an error.
     * @throws {Error} If the update operation failed.
     */
    async updateAllNotifications(recieverId: string): Promise<void> {
        try {
            const result = await this.notificationRepository.updateAllNotifications(
                recieverId
            );

            if (!result) throw new Error("An unexpected error occured !");
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Deletes a notification with the specified ID from the database.
     * @param notificationId - The ID of the notification to be deleted.
     * @returns A promise that resolves when the notification is successfully deleted, or rejects with an error if the deletion fails.
     * @throws {BadRequestError} If the notification cannot be deleted.
     */
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            const result = await this.notificationRepository.delete({
                _id: notificationId,
            });

            if (!result) throw new BadRequestError("An unexpected error occured !");
        } catch (err: unknown) {
            throw err;
        }
    }
}
