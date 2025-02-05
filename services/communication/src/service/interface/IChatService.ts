/** Interface for Chat Service */
export interface IChatService {
    getChats(_id: string): Promise<void>;
    getMessages(chatId: string): Promise<void>;
}
