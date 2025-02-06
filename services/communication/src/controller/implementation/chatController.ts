import { Request, Response, NextFunction } from "express";
import { IChatController } from "../interface/IChatController";
import {
    HTTPStatusCodes,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";
import { IChatService } from "../../service/interface/IChatService";

/** Implementation for Chat Controller */
export class ChatController implements IChatController {
    private chatService: IChatService;

    constructor(chatService: IChatService) {
        this.chatService = chatService;
    }

    /**
     * Retrieves the list of chats for a user with id `_id`.
     * @param req - The express request object containing the user id in the request body.
     * @param res - The express response object used to send the list of chats.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the chat list retrieval process is complete.
     */
    async getChats(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { _id } = req.body.user;

            const data = await this.chatService.getChats(_id);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err) {
            next(err);
        }
    }
}
