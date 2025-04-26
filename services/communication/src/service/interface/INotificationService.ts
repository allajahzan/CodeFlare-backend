import { INotificationDto } from "../../dto/notificationDto";
import { INotificationSchema } from "../../entities/INotification";

/** Interface for Notification Service */
export interface INotificationService {
    getNotifications(recieverId: string): Promise<INotificationDto[]>;
    createNotification(notification: Partial<INotificationSchema>): Promise<INotificationSchema>;
    updateNotification(notificationId: string): Promise<INotificationSchema>;
    updateAllNotifications(recieverId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
}
