import { RabbitMQConnection } from "@codeflare/common";
import amqp from "amqplib";
import snapshotConsumer from "../events/consumer/snapshotConsumer";

class RabbitMQ {
    private _channel: amqp.Channel | null = null;

    constructor() { }

    // get channel
    get channel(): amqp.Channel {
        if (!this._channel)
            throw new Error("cannot access rabbitmq before connection");
        return this._channel;
    }

    // connect to rabbitmq
    async connect(): Promise<void> {
        try {
            this._channel = await RabbitMQConnection(
                process.env.RABBIT_MQ_URL as string
            );

            this._channel.on("close", () => {
                console.log("Rabbitmq connection closed, reconnecting...");
                this._channel = null;
                this.connect();
            });

            // consumers
            snapshotConsumer.consume();
            
        } catch (err: any) {
            throw new Error(err);
        }
    }
}

export const rabbitmq = new RabbitMQ();
