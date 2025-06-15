import { rabbitmq } from "../../config/rabbitmq";
import { Exchanges } from "@codeflare/common";
import { AttendenceRepository } from "../../repository/implementation/attendenceRepository";
import Attendence from "../../model/attendence";

// Attendance repository
const attendenceRepository = new AttendenceRepository(Attendence);

// Snapshot producer
export class SnapshotProducer {
    private time: string;
    private message: string;

    /**
     * Constructor for SnapshotProducer
     * @param time - The time of the snapshot notification
     * @param message - The message to be sent with the snapshot notification
     */
    constructor(time: string, message: string) {
        this.time = time;
        this.message = message;
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
                        message: this.message,
                    })
                ),
                { persistent: true }
            );

            console.log("Snapshot event published");
        } catch (err: any) {
            console.log(err);
            throw new Error(err);
        }
    }
}
