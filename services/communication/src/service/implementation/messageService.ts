import { IMessageSchema } from "../../entities/IMessageSchema";
import { IMessageRepository } from "../../repository/interface/IMessageRepository";
import { IMessageService } from "../interface/IMessageService";

/** Implementation for Message Service */
export class MessageService implements IMessageService {
    private messageRepository: IMessageRepository;

    /**
     * Constructor for Message Service
     * @param {IMessageRepository} messageRepository - Instance of message repository
     */
    constructor(messageRepository: IMessageRepository) {
        this.messageRepository = messageRepository;
    }

    /**
     * Retrieves the list of messages for a chat with id `chatId`.
     * @param {string} chatId - The id of the chat to retrieve messages for.
     * @returns A promise that resolves to an array of message documents or null if no messages are found.
     * @throws An error if there is a problem retrieving the messages.
     */
    async getMessages(chatId: string): Promise<IMessageSchema[] | null> {
        try {
            const messages = this.messageRepository.getMessages(chatId, 0);
            return messages;
        } catch (err: unknown) {
            throw err;
        }
    }
}
