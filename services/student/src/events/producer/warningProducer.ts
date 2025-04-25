import { rabbitmq } from "../../config/rabbitmq";
import { Exchanges, IUser } from "@codeflare/common";

// Warning producer
export class WarningProducer {
    private senderId: string;
    private sender: IUser;
    private receiverId: string;
    private message: string;

    constructor(
        senderId: string,
        sender: IUser,
        receiverId: string,
        message: string
    ) {
        this.senderId = senderId;
        this.sender = sender;
        this.receiverId = receiverId;
        this.message = message;
    }

    async publish() {
        try {
            // Await the promise
            await rabbitmq.channel.assertExchange(Exchanges.WARNING_EXCHANGE, "fanout", {
                durable: true,
            });
    
            rabbitmq.channel.publish(
                Exchanges.WARNING_EXCHANGE,
                "",
                Buffer.from(
                    JSON.stringify({
                        senderId: this.senderId,
                        sender: this.sender,
                        receiverId: this.receiverId,
                        message: this.message,
                    })
                ),
                { persistent: true }
            );
    
            console.log("Warning event published");
        } catch (err: any) {
            console.log(err);
            throw new Error(err?.message || "Something went wrong !");
        }
    }
}    
