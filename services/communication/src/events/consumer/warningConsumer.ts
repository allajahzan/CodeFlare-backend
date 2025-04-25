import amqp from "amqplib";
import { rabbitmq } from "../../config/rabbitmq";
import { Exchanges, QUEUES } from "@codeflare/common";
import { getIO } from "../../socket/connection";

// Warning consumer
class WarningConsumer {
    consume() {
        try {
            // Assert exchange - fanout
            rabbitmq.channel.assertExchange(Exchanges.WARNING_EXCHANGE, "fanout", {
                durable: true,
            });

            // Assert queue
            rabbitmq.channel.assertQueue(QUEUES.WARNING_QUEUE, {
                durable: true,
            });

            // Bind queue to exchange
            rabbitmq.channel.bindQueue(
                QUEUES.WARNING_QUEUE,
                Exchanges.WARNING_EXCHANGE,
                ""
            );

            // Consume message
            rabbitmq.channel.consume(
                QUEUES.WARNING_QUEUE,
                async (data: amqp.ConsumeMessage | null) => {
                    try {
                        if (!data) throw new Error("recieved null message");

                        const message = JSON.parse(data.content as any); // Message

                        if (!message || !message.time)
                            throw new Error("recieved null message");

                        // Emit message to all connected clients
                        const io = getIO();
                        io.emit("receiveWarning", message);

                        rabbitmq.channel.ack(data);
                        console.log("data consumed from queue", message);
                    } catch (err) {
                        rabbitmq.channel.nack(data as amqp.ConsumeMessage, false, true);
                        console.log(err);
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
