import amqp from "amqplib";
import { rabbitmq } from "../../config/rabbitmq";
import { Exchanges, QUEUES, IWarning } from "@codeflare/common";
import { getIO } from "../../socket/connection";
import { NotificationRepository } from "../../repository/implementation/notificationRespository";
import { NotificationService } from "../../service/implementation/notificationService";
import Notification from "../../model/notificationSchema";
import { INotificationSchema } from "../../entities/INotification";
import { getSocketId } from "../../utils/registerUser";
import { ObjectId } from "mongoose";

// Dependency Injuction
const notificationRepository = new NotificationRepository(Notification);
const notificationService = new NotificationService(notificationRepository);

// Warning consumer
class WarningConsumer {
    async consume() {
        try {
            // Assert exchange - fanout
            await rabbitmq.channel.assertExchange(
                Exchanges.WARNING_EXCHANGE,
                "fanout",
                {
                    durable: true,
                }
            );

            // Assert queue
            await rabbitmq.channel.assertQueue(QUEUES.WARNING_QUEUE, {
                durable: true,
            });

            // Bind queue to exchange
            await rabbitmq.channel.bindQueue(
                QUEUES.WARNING_QUEUE,
                Exchanges.WARNING_EXCHANGE,
                ""
            );

            // Consume message
            rabbitmq.channel.consume(
                QUEUES.WARNING_QUEUE,
                async (data: amqp.ConsumeMessage | null) => {
                    try {
                        if (!data) throw new Error("Received null message");

                        const message: IWarning = JSON.parse(data.content.toString());

                        if (!message) throw new Error("Received malformed message");

                        // Notification
                        const notification: Partial<INotificationSchema> = {
                            senderId: message.senderId as unknown as ObjectId,
                            receiverId: message.receiverId as unknown as ObjectId,
                            message: message.message,
                            type: "warning",
                            path: "/student/attendance/warning-messages",
                        };

                        // Create new notification
                        await notificationService.createNotification(notification);

                        // Socket instance
                        const io = getIO();

                        // Send notification event to the exact receiver
                        io.to((await getSocketId(message.receiverId)) as string).emit(
                            "receiveWarning",
                            { ...message, date: new Date() }
                        );

                        // Acknowledge message
                        rabbitmq.channel.ack(data);

                        console.log("Warning event consumed and send notification");
                    } catch (err) {
                        console.error("Consumer processing error:", err);
                        rabbitmq.channel.nack(data as amqp.ConsumeMessage, false, true);
                    }
                }
            );
        } catch (err) {
            console.log(err);
        }
    }
}

const warningConsumer = new WarningConsumer();
export default warningConsumer;
