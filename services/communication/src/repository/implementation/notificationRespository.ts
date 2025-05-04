import { BaseRepository } from "@codeflare/common";
import { INotificationSchema } from "../../entities/INotification";
import { INotificationRepository } from "../interface/INotificationRepository";
import { Model, Types, UpdateWriteOpResult } from "mongoose";

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
        receiverId: string
    ): Promise<UpdateWriteOpResult | null> {
        try {
            const updatedNotifications = await this.model.updateMany(
                { receiverId, isRead: false },
                { $set: { isRead: true } }
            );
            return updatedNotifications;
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Retrieves the list of notifications for a user with the given recieverId. The retrieval is limited to the last four weeks.
     * @param receiverId - The id of the user to retrieve notifications for.
     * @param limit - The maximum number of notifications to retrieve.
     * @param skip - The number of notifications to skip before retrieving notifications.
     * @returns A promise that resolves to the list of notifications as INotificationSchema objects or null if no notifications are found.
     * @throws An error if there is a problem retrieving the notifications.
     */
    async getNotifications(
        receiverId: string,
        limit?: number,
        skip?: number
    ): Promise<INotificationSchema[] | null> {
        try {
            const now = new Date();
            const fourWeeksAgo = new Date();
            fourWeeksAgo.setDate(now.getDate() - 28);

            const pipeline: any[] = [
                {
                    $match: {
                        receiverId: new Types.ObjectId(receiverId),
                        createdAt: {
                            $gte: fourWeeksAgo,
                            $lte: now,
                        },
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
            ];

            // If limit and skip is given, apply it to the aggregation pipeline
            if (typeof skip === "number" && skip > 0) {
                pipeline.push({ $skip: skip });
            }

            if (typeof limit === "number" && limit > 0) {
                pipeline.push({ $limit: limit });
            }

            const notifications = await this.model.aggregate(pipeline);

            return notifications.length > 0 ? notifications : null;
        } catch (err: unknown) {
            return null;
        }
    }
}
