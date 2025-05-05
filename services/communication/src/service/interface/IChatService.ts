import { IChatDto } from "../../dto/chatServiceDto";

/** Interface for Chat Service */
export interface IChatService {
    getChatsByUserId(userId: string): Promise<IChatDto[] | null>;
}
