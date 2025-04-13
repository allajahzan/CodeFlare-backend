import { rabbitmq } from "../../config/rabbitmq";
import { Exchanges } from "@codeflare/common";

// Snapshot producer
export class SnapshotProducer {
    private time: string;

    constructor(time: string) {
        this.time = time;
    }

    publish() {
        try {
            // Assert exchange - fanout
            rabbitmq.channel.assertExchange(Exchanges.SNAP_SHOT_EXCHANGE, "fanout", {
                durable: true,
            });

            // Publish to exchange
            rabbitmq.channel.publish(
                Exchanges.SNAP_SHOT_EXCHANGE,
                "",
                Buffer.from(
                    JSON.stringify({
                        time: this.time,
                    })
                ),
                { persistent: true }
            );

            console.log("Snapshot event published", this.time);
        } catch (err: any) {
            console.log(err);
            throw new Error(err);
        }
    }
}
