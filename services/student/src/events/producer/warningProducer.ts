import { rabbitmq } from "../../config/rabbitmq";
import { Exchanges } from "@codeflare/common";

// Warning producer
export class WarningProducer {
    private time: string;
    private message: string;
    private sender: {
        name: string;
        email: string;
        role: string;
        profilePic: string;
    };
    private reciver: string;

    constructor(
        time: string,
        message: string,
        sender: {
            name: string;
            email: string;
            role: string;
            profilePic: string;
        },
        reciver: string
    ) {
        this.time = time;
        this.message = message;
        this.sender = sender;
        this.reciver = reciver;
    }

    publish() {
        try {
            // Assert exchange - fanout
            rabbitmq.channel.assertExchange(Exchanges.WARNING_EXCHANGE, "fanout", {
                durable: true,
            });

            // Publish to exchange
            rabbitmq.channel.publish(
                Exchanges.WARNING_EXCHANGE,
                "",
                Buffer.from(
                    JSON.stringify({
                        time: this.time,
                        message: this.message,
                        sender: this.sender,
                        reciever: this.reciver,
                        path: "/student/attendence/warning",
                    })
                ),
                { persistent: true }
            );

            console.log("Warning event published");
        } catch (err: any) {
            console.log(err);
            throw new Error(err);
        }
    }
}
