import { Server } from "socket.io";
import Chat from "../model/chatSchema";
import { ChatRepository } from "../repository/implementation/chatRepository";
import { MessageRepository } from "../repository/implementation/messageRepository";
import Message from "../model/messageSchema";
import { ObjectId } from "mongoose";

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

                    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

                    if (receiverSocketId) {
                        socket
                            .to(receiverSocketId)
                            .emit("receivePrivateMessage", { senderId, receiverId, message });
                    }

                    const chatRepository = new ChatRepository(Chat); // Instance of chat repository
                    const messageRepository = new MessageRepository(Message); // Instance of message repository

                    let chat = await chatRepository.findOneAndUpdate(
                        { participants: [senderId, receiverId] },
                        { $set: { lastMessage: message } },
                        { new: true, upsert: true }
                    );

                    if (chat) {
                        await messageRepository.create({
                            chatId: chat._id as ObjectId,
                            senderId,
                            receiverId,
                            message,
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
