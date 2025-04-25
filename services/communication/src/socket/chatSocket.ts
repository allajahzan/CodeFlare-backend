import Chat from "../model/chatSchema";
import { ChatRepository } from "../repository/implementation/chatRepository";
import { MessageRepository } from "../repository/implementation/messageRepository";
import Message from "../model/messageSchema";
import { ObjectId } from "mongoose";
import { getUser } from "../grpc/client/userClient";
import {
    getRegisteredUsers,
    getSocketId,
    isUserRegistered,
    registerUser,
    unRegisterUser,
} from "../utils/registerUser";
import { DefaultEventsMap, Server, Socket } from "socket.io";

const chatRepository = new ChatRepository(Chat); // Instance of chat repository
const messageRepository = new MessageRepository(Message); // Instance of message repository

// Chat Socket
export const chatSocket = async (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
    try {
        // From redis
        const registeredUsers = await getRegisteredUsers();

        // When a user registers ======================================================================
        socket.on("registerUser", async (userId: string) => {
            console.log(`Registering user ${userId} with socket ID: ${socket.id}`);

            // Cache in redis
            await registerUser({ userId, socketId: socket.id });
        });

        // Get online user ===========================================================================
        socket.on("userOnline", async (receiverId: string) => {
            let status = await isUserRegistered(receiverId);
            if (status) {
                io.emit("userOnline", { receiverId, isOnline: true });
            }
        });

        // when a user types ==========================================================================
        socket.on(
            "userTyping",
            async ({
                senderId,
                receiverId,
                isTyping,
            }: {
                senderId: string;
                receiverId: string;
                isTyping: boolean;
            }) => {
                let status = await isUserRegistered(receiverId);
                if (status) {
                    io.to((await getSocketId(receiverId)) as string).emit("userTyping", {
                        senderId,
                        receiverId,
                        isTyping,
                    });
                }
            }
        );

        // When a user send private message ============================================================
        socket.on(
            "sendPrivateMessage",
            async ({
                senderId,
                receiverId,
                content,
                message,
            }: {
                senderId: string;
                receiverId: string;
                content: string;
                message: string;
            }) => {
                const [receiverSocketId, senderSocketId] = await Promise.all([
                    await getSocketId(receiverId),
                    await getSocketId(senderId),
                ]);

                // console.log(receiverSocketId, senderSocketId);

                // console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

                // Find chat
                let chatPromise = chatRepository.findOne({
                    participants: { $all: [senderId, receiverId] },
                });

                // Get sender and receiver details from user service with gRPC and also chat
                let sender;
                let [resp, chat] = await Promise.all([getUser(senderId), chatPromise]);

                if (resp && resp.response.status === 200) {
                    sender = resp.response.user;
                } else {
                    throw new Error("Failed to send message due to some issue!");
                }

                // Send message back to receiver
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receivePrivateMessage", {
                        senderId,
                        receiverId,
                        sender,
                        content,
                        message,
                    });
                }

                // If no existing chat, create a new one
                if (!chat) {
                    chat = await chatRepository.create({
                        participants: [
                            senderId as unknown as ObjectId,
                            receiverId as unknown as ObjectId,
                        ],
                        content,
                        lastMessage: message,
                    });
                } else {
                    // Update last message
                    chat = await chatRepository.findOneAndUpdate(
                        { _id: chat?._id },
                        { $set: { lastMessage: message, content } },
                        { new: true }
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
                    io.to(senderSocketId as string)
                        .to(receiverSocketId as string)
                        .emit("chatInfo", { chatInfo });
                }

                // Save Message
                await messageRepository.create({
                    chatId: chat?._id as ObjectId,
                    senderId: senderId as unknown as ObjectId,
                    receiverId: receiverId as unknown as ObjectId,
                    content,
                    message,
                });
            }
        );

        // Load more messages when scroll to top =======================================================
        socket.on(
            "loadMoreMessages",
            async ({
                userId,
                chatId,
                skip,
            }: {
                userId: string;
                chatId: string;
                skip: number;
            }) => {
                const messages = await messageRepository.getMessages(chatId, skip);

                io.emit("loadedMessages", { messages, chatId, userId });
            }
        );

        // when socket disconnects =====================================================================
        socket.on("disconnect", async () => {
            try {
                await unRegisterUser(socket.id);
                console.log("Socket disconnected - chat socket");
            } catch (error) {
                console.log(error);
            }
        });
    } catch (err: unknown) {
        throw err;
    }
};
