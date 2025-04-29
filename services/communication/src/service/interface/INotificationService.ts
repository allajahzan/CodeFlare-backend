import { INotificationDto } from "../../dto/notificationDto";
import { INotificationSchema } from "../../entities/INotification";

/** Interface for Notification Service */
export interface INotificationService {
    getNotifications(receiverId: string, limit: number, skip: number): Promise<INotificationDto[]>;
    createNotification(notification: Partial<INotificationSchema>): Promise<INotificationSchema>;
    updateNotification(notificationId: string): Promise<INotificationSchema>;
    updateAllNotifications(receiverId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
}
