import { INotificationSchema } from "../../entities/INotification";

/** Interface for Notification Service */
export interface INotificationService {
    getNotifications(recieverId: string): Promise<INotificationSchema[]>;
    createNotification(notification: Partial<INotificationSchema>): Promise<INotificationSchema>;
    updateNotification(notificationId: string): Promise<INotificationSchema>;
    updateAllNotifications(recieverId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
}
