import { IChatSchema } from "../../entities/IChatSchema";

/** Interface for Chat Service */
export interface IChatService {
    getChats(_id: string): Promise<IChatSchema[] | null>;
}
