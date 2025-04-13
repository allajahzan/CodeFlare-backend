import amqp from "amqplib";
import { rabbitmq } from "../../config/rabbitmq";
import { Exchanges, QUEUES } from "@codeflare/common";

// Snapshot consumer
class SnapshotConsumer {
    consume() {
        try {
            // Assert exchange - fanout
            rabbitmq.channel.assertExchange(Exchanges.SNAP_SHOT_EXCHANGE, "fanout", {
                durable: true,
            });

            // Assert queue
            rabbitmq.channel.assertQueue(QUEUES.SNAP_SHOT_QUEUE, {
                durable: true,
            });

            // Bind queue to exchange
            rabbitmq.channel.bindQueue(
                QUEUES.SNAP_SHOT_QUEUE,
                Exchanges.SNAP_SHOT_EXCHANGE,
                ""
            );

            // Consume message
            rabbitmq.channel.consume(
                QUEUES.SNAP_SHOT_QUEUE,
                async (data: amqp.ConsumeMessage | null) => {
                    try {
                        if (!data) throw new Error("recieved null message");

                        const message = JSON.parse(data.content as any);
                        
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

const snapshotConsumer = new SnapshotConsumer();
export default snapshotConsumer;
