import { IBaseRepository } from "@codeflare/common";
import { INotificationSchema } from "../../entities/INotification";
import { UpdateWriteOpResult } from "mongoose";

/** Interface for Notification Repository */
export interface INotificationRepository extends IBaseRepository<INotificationSchema> {
    updateAllNotifications(recieverId: string): Promise<UpdateWriteOpResult| null>
}