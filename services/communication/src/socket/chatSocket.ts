import { Server } from "socket.io";
import Chat from "../model/chatSchema";
import { ChatRepository } from "../repository/implementation/chatRepository";

let users: { [key: string]: string } = {};

// Chat Socket
export const chatSocket = (server: any) => {
    try {
        const io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
            },
        });

        io.on("connection", (socket) => {
            console.log("socket connected", socket.id);

            // When a user registers
            socket.on("registerUser", (userId) => {
                users[userId] = socket.id;
                console.log(
                    `User with ID ${userId} registered with socket ID: ${socket.id}`
                );
            });

            // When a user send private message
            socket.on(
                "sendPrivateMessage",
                async ({ senderId, receiverId, message }) => {
                    const receiverSocketId = users[receiverId];

                    if (receiverSocketId) {
                        socket
                            .to(receiverSocketId)
                            .emit("receivePrivateMessage", { senderId, receiverId, message });
                    }

                    const chatRepository = new ChatRepository(Chat); // Instance of chat repository
                    

                    let chat = await chatRepository.findOne({
                        participants: [senderId, receiverId],
                    });

                    if (chat) {
                        await chatRepository.update(
                            { participants: [senderId, receiverId] },
                            { lastMessage: message }
                        );
                    } else {
                        await chatRepository.create({
                            participants: [senderId, receiverId],
                            lastMessage: message,
                        });
                    }

                }
            );

            // when socket disconnects
            socket.on("disconnect", () => {
                for (let userId in users) {
                    if (users[userId] === socket.id) {
                        delete users[userId];
                        break;
                    }
                }
                console.log("socket disconnected", socket.id);
            });
        });
    } catch (err: unknown) {
        throw err;
    }
};
