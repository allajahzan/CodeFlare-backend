import { IBaseRepository } from "@codeflare/common";
import { INotificationSchema } from "../../entities/INotification";
import { UpdateWriteOpResult } from "mongoose";

/** Interface for Notification Repository */
export interface INotificationRepository extends IBaseRepository<INotificationSchema> {
    updateAllNotifications(receiverId: string): Promise<UpdateWriteOpResult| null>
    getNotifications(receiverId: string, limit: number, skip: number): Promise<INotificationSchema[] | null>
}