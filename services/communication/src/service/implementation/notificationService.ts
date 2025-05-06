import { BadRequestError, IStudent, IUser } from "@codeflare/common";
import { INotificationSchema } from "../../entities/INotification";
import { INotificationRepository } from "../../repository/interface/INotificationRepository";
import { INotificationService } from "../interface/INotificationService";
import { getUsers } from "../../grpc/client/userClient";
import { INotificationDto } from "../../dto/notificationDto";

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
     * @param receiverId - The id of the user to retrieve notifications for.
     * @returns A promise that resolves to the list of notifications as INotificationSchema objects or an empty array if no notifications are found.
     * @throws An error if there is a problem retrieving the notifications.
     */
    async getNotifications(
        receiverId: string,
        limit: number,
        skip: number
    ): Promise<INotificationDto[]> {
        try {
            const notifications = await this.notificationRepository.getNotifications(
                receiverId as string,
                limit,
                skip
            );

            if (!notifications || notifications.length === 0) {
                return [];
            }

            let userIds: string[] = []; // User Ids

            for (let i = 0; i < notifications.length; i++) {
                userIds.push(notifications[i].senderId as unknown as string);
            }

            let usersMap: Record<string, IUser | IStudent>;

            // Fetch users info from user service through gRPC
            const resp = await getUsers([...new Set(userIds)], "");

            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            } else {
                throw new Error("Failed load chats due to some issues!");
            }

            // Map data to return type
            const notificationsDto: INotificationDto[] = notifications.map(
                (notification) => {
                    return {
                        _id: notification._id as unknown as string,
                        senderId: notification.senderId as unknown as string,
                        sender: usersMap[notification.senderId as unknown as string],
                        recieverId: notification.senderId as unknown as string,
                        message: notification.message,
                        type: notification.type,
                        path: notification.path,
                        date: notification.date,
                    };
                }
            );

            return notificationsDto;
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
        notification: Partial<INotificationSchema>
    ): Promise<INotificationDto> {
        try {
            const newNotifaction = await this.notificationRepository.create(
                notification
            );

            if (!newNotifaction)
                throw new BadRequestError("An unexpected error occured!");

            // Map data to return type
            const notificationDto: INotificationDto = {
                _id: newNotifaction._id as unknown as string,
                senderId: newNotifaction.senderId as unknown as string,
                recieverId: newNotifaction.receiverId as unknown as string,
                message: newNotifaction.message,
                type: newNotifaction.type,
                path: newNotifaction.path,
                date: newNotifaction.date,
            };

            return notificationDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates a notification in the system to mark it as read.
     * @param notificationId - The ID of the notification to be updated.
     * @returns A promise that resolves when the notification update process is complete.
     * @throws {BadRequestError} If the notification could not be updated.
     */
    async updateNotification(notificationId: string): Promise<void> {
        try {
            const updatedNotification = await this.notificationRepository.update(
                { _id: notificationId },
                { $set: { isRead: true } }
            );

            if (!updatedNotification)
                throw new BadRequestError("Failed to mark notification as read!");
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates all unread notifications in the database to mark them as read.
     * @param receiverId - The id of the user to update the notifications for.
     * @returns A promise that resolves to null if the update operation was successful, otherwise rejects with an error.
     * @throws {Error} If the update operation failed.
     */
    async updateAllNotifications(receiverId: string): Promise<void> {
        try {
            const result = await this.notificationRepository.updateAllNotifications(
                receiverId
            );

            if (!result) throw new Error("Failed to mark notifications as read!");
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

            if (!result) throw new BadRequestError("Failed to delete notification!");
        } catch (err: unknown) {
            throw err;
        }
    }
}
