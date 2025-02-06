import { IChatSchema } from "../../entities/IChatSchema";
import { getUser } from "../../grpc/client/userClient";
import { IChatRepository } from "../../repository/interface/IChatRepository";
import { IChatService } from "../interface/IChatService";

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
     * @param {_id} - The id of the user to retrieve chats for.
     * @returns A promise that resolves to an array of chat documents or null if no chats are found.
     * @throws An error if there is a problem retrieving the chats.
     */
    async getChats(_id: string): Promise<IChatSchema[] | null> {
        try {
            // Get chats from repository
            const chats = await this.chatRepository.getChatsById(_id);
            if (!chats || !chats.length) return null;

            // Get unique user ids
            const userIds = new Set<string>();
            chats.forEach((chat) => {
                userIds.add(chat.participants[0].toString());
                userIds.add(chat.participants[1].toString());
            });

            // Fetch user details using gRPC
            const userDetailsMap = new Map<string, any>(); // Store user details
            for (const userId of userIds) {
                const userDetails = await getUser(userId); // gRPC call
                if (userDetails) {
                    userDetailsMap.set(userId, userDetails);
                }
            }

            // Replace senderId and receiverId with full user details
            const formattedChats = chats.map(chat => ({
                chat,
                sender: userDetailsMap.get(chat.participants[0].toString()) || null,
                receiver: userDetailsMap.get(chat.participants[1].toString()) || null,
            }));

            return formattedChats as any;
        } catch (err: unknown) {
            throw err;
        }
    }

    async getMessages(chatId: string): Promise<void> {
        try {
            console.log(chatId);
        } catch (err: unknown) {
            throw err;
        }
    }
}
