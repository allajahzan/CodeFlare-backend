import { IChatDto, IUser } from "../../dto/chatServiceDto";
import { getUsers } from "../../grpc/client/userClient";
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
     * @param {_id: string} - The id of the user to retrieve chats for.
     * @returns A promise that resolves to an array of chat documents or null if no chats are found.
     * @throws An error if there is a problem retrieving the chats.
     */
    async getChats(_id: string): Promise<IChatDto[] | null> {
        try {
            console.log(_id);
            
            // Get chats from repository
            const chats = await this.chatRepository.getChatsById(_id);
            if (!chats || !chats.length) return null;

            let userIds: string[] = []; // User Ids

            for (let i = 0; i < chats.length; i++) {
                userIds.push(...(chats[i].participants as unknown as string[]));
            }

            // Get users from user service through gRPC
            let usersMap: Record<
                string,
                {
                    _id: string;
                    name: string;
                    email: string;
                    role: string;
                    profilePic: string;
                    batch: string;
                }
            >;

            // Fetch users info through gRPC
            const resp = await getUsers([...new Set(userIds)]);

            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            } else {
                throw new Error("Failed load chats due to some issues!");
            }

            return chats.map((chat) => {
                const sender = usersMap[
                    chat.participants[0] as unknown as string
                ] as IUser;
                const receiver = usersMap[
                    chat.participants[1] as unknown as string
                ] as IUser;
                return {
                    ...chat.toObject(),
                    sender: {
                        ...sender,
                    },
                    receiver: {
                        ...receiver,
                    },
                };
            });
        } catch (err: unknown) {
            throw err;
        }
    }
}
