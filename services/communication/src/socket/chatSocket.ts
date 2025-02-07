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

                    // Find chat
                    let chatPromise = chatRepository.findOne({
                        participants: { $all: [senderId, receiverId] },
                    });

                    // Get sender and receiver details from user service with gRPC and also chat
                    let [sender, receiver, chat] = await Promise.all([
                        getUser(senderId),
                        getUser(receiverId),
                        chatPromise,
                    ]);

                    // Send message back to receiver
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit("receivePrivateMessage", {
                            senderId,
                            receiverId,
                            sender,
                            message,
                        });
                    }

                    // If no existing chat, create a new one
                    if (!chat) {
                        chat = await chatRepository.create({
                            participants: [senderId, receiverId],
                            sender,
                            receiver,
                            lastMessage: message,
                        });
                    } else {
                        // Update last message
                        await chatRepository.update(
                            { _id: chat?._id },
                            { $set: { lastMessage: message, sender, receiver } }
                        );
                    }

                    // Sender-Receiver chat Info
                    const chatInfo = {
                        chatId: chat?.id as string,
                        senderId,
                        receiverId,
                    };

                    // Emit chat Info to both users
                    if (senderSocketId || receiverSocketId) {
                        io.to(senderSocketId)
                            .to(receiverSocketId)
                            .emit("chatInfo", { chatInfo });
                    }

                    // Save Message
                    await messageRepository.create({
                        chatId: chat?._id as ObjectId,
                        senderId,
                        receiverId,
                        message,
                    });
                }
            );

            // Load more messages when scroll to top
            socket.on("loadMoreMessages", async ({ userId, chatId, skip }) => {
                const messages = await messageRepository.findLast_20_Messages(
                    chatId,
                    skip
                );

                io.emit("loadedMoreMessages", { messages, chatId, userId });
            });

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
