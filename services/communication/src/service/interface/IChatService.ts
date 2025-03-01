import { IChatDto } from "../../dto/chatServiceDto";

/** Interface for Chat Service */
export interface IChatService {
    getChats(_id: string): Promise<IChatDto[] | null>;
}
