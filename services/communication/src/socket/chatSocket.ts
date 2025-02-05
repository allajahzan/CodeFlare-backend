import { Server } from "socket.io";
import Chat from "../model/chatSchema";
import { ChatRepository } from "../repository/implementation/chatRepository";
import { MessageRepository } from "../repository/implementation/messageRepository";
import Message from "../model/messageSchema";
import { ObjectId } from "mongoose";
import { getUser } from "../grpc/client/userClient";

let users: { [key: string]: string } = {};
const chatRepository = new ChatRepository(Chat); // Instance of chat repository
const messageRepository = new MessageRepository(Message); // Instance of message repository

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
                    const senderSocketId = users[senderId];

                    console.log(receiverSocketId, senderSocketId);

                    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

                    // Send message back to receiver
                    if (receiverSocketId) {
                        socket
                            .to(receiverSocketId)
                            .emit("receivePrivateMessage", { senderId, receiverId, message });
                    }

                    // Save chat
                    let newChat = await chatRepository.findOneAndUpdate(
                        { participants: [senderId, receiverId] },
                        { $set: { lastMessage: message } },
                        { new: true, upsert: true }
                    );

                    if (newChat) {
                        // Save messages
                        const messagePromise = messageRepository.create({
                            chatId: newChat._id as ObjectId,
                            senderId,
                            receiverId,
                            message,
                        });

                        // Get sender and receiver data
                        const getSenderPromise = getUser(senderId);
                        const getReceiverPromise = getUser(receiverId);

                        const [sender, receiver, _] = await Promise.all([
                            getSenderPromise,
                            getReceiverPromise,
                            messagePromise,
                        ]);

                        // chat
                        const chat = {
                            sender,
                            receiver,
                            lastMessage: newChat.lastMessage,
                            updatedAt: newChat.updatedAt,
                        };

                        // Emit chats to sender and receiver
                        if (senderSocketId || receiverSocketId) {
                            io
                            .to(senderSocketId)
                            .to(receiverSocketId)
                            .emit("chats", { chat });
                        }
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
