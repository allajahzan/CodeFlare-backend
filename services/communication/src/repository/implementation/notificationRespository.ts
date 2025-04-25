import { BaseRepository } from "@codeflare/common";
import { INotificationSchema } from "../../entities/INotification";
import { INotificationRepository } from "../interface/INotificationRepository";
import { Model, UpdateWriteOpResult } from "mongoose";

/** Implementation of Notification Repository */
export class NotificationRepository
    extends BaseRepository<INotificationSchema>
    implements INotificationRepository {
    /**
     * Constructor for Notification Repository
     * @param model - Mongoose Model for Notification
     */
    constructor(model: Model<INotificationSchema>) {
        super(model);
    }

    /**
     * Updates all unread notifications in the database to mark them as read.
     * @returns A promise that resolves to the result of the update operation if successful, or null if the update fails.
     */
    async updateAllNotifications(
        recieverId: string
    ): Promise<UpdateWriteOpResult | null> {
        try {
            const updatedNotifications = await this.model.updateMany(
                { recieverId, isRead: false },
                { $set: { isRead: true } }
            );
            return updatedNotifications;
        } catch (err: unknown) {
            return null;
        }
    }
}
