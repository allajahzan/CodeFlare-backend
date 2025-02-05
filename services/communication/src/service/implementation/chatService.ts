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

    async getChats(_id: string): Promise<void> {
        try {
            console.log(_id);
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
