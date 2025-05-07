import {
    IBatch,
    IStudent,
    IStudentCategory,
    IUser,
    IWeek,
} from "@codeflare/common";
import { IChatDto, IChatUser } from "../../dto/chatServiceDto";
import { getUsers } from "../../grpc/client/userClient";
import { IChatRepository } from "../../repository/interface/IChatRepository";
import { IChatService } from "../interface/IChatService";
import { getCachedBatch, getCachedBatches } from "../../utils/cachedBatch";
import { ObjectId } from "mongoose";
import { getCachedWeek } from "../../utils/cachedWeek";

/** Implementation for Chat Service */
export class ChatService implements IChatService {
    private chatRepository: IChatRepository;

    /**
     * Constructor for Chat Service
     * @param {IChatRepository} chatRepository - Instance of chat repository
     */
    constructor(chatRepository: IChatRepository) {
        this.chatRepository = chatRepository;
    }

    /**
     * Retrieves the list of chats for a user with id `_id`.
     * @param {_id: string} - The id of the user to retrieve chats for.
     * @returns A promise that resolves to an array of chat documents or null if no chats are found.
     * @throws An error if there is a problem retrieving the chats.
     */
    async getChatsByUserId(userId: string): Promise<IChatDto[] | null> {
        try {
            // Get chats from repository
            const chats = await this.chatRepository.getChatsByUserId(userId);
            if (!chats || chats.length === 0) {
                return null;
            }

            let userIds: string[] = []; // User Ids

            for (let i = 0; i < chats.length; i++) {
                userIds.push(...(chats[i].participants as unknown as string[]));
            }

            // Get users from user service through gRPC
            let usersMap: Record<string, IUser | IStudent>;

            // Fetch users info through gRPC
            const resp = await getUsers([...new Set(userIds)], "");

            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            } else {
                throw new Error("Failed load chats due to some issues!");
            }

            // Map data to return type
            const chatsDto: IChatDto[] = await Promise.all(
                chats.map(async (chat) => {
                    const chatSender =
                        usersMap[chat.participants[0] as unknown as string];
                    const chatReceiver =
                        usersMap[chat.participants[1] as unknown as string];

                    const sender: IChatUser = {
                        _id: chatSender._id,
                        name: chatSender.name,
                        email: chatSender.email,
                        role: chatSender.role,
                        profilePic: chatSender.profilePic,
                        ...(chatSender.phoneNo ? { phoneNo: chatSender.phoneNo } : {}),
                        week: (await getCachedWeek(
                            (chatSender as IStudent).week as string
                        )) as IWeek,
                        ...((chatSender as IStudent)?.batch
                            ? {
                                batch: (await getCachedBatch(
                                    (chatSender as IStudent).batch
                                )) as IBatch,
                            }
                            : {}),
                        ...((chatSender as IUser)?.batches
                            ? {
                                batches: (await getCachedBatches(
                                    (chatSender as IUser).batches as unknown as ObjectId[]
                                )) as IBatch[],
                            }
                            : {}),
                        ...((chatSender as IStudent).category
                            ? {
                                category: (chatSender as IStudent).category,
                            }
                            : {}),
                        lastActive: chatSender.lastActive,
                        createdAt: chatSender.createdAt,
                        isBlock: chatSender.isBlock,
                    };

                    return {
                        _id: chat._id as string,
                        content: chat.content,
                        lastMessage: chat.lastMessage,
                        participants: chat.participants as unknown as string[],
                        sender,
                        receiver: chatReceiver as unknown as IChatUser,
                        updatedAt: chat.updatedAt,
                    };
                })
            );

            return chatsDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
