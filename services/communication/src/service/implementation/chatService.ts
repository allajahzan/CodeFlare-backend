import { IChatSchema } from "../../entities/IChatSchema";
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

            return chats;
        } catch (err: unknown) {
            throw err;
        }
    }
}
