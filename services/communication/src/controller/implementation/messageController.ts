import { Request, Response, NextFunction } from "express";
import { IMessageController } from "../interface/IMessageController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";
import { IMessageService } from "../../service/interface/IMessageService";

/** Implementation for Message Controller */
export class MessageController implements IMessageController {
    private messageService: IMessageService;

    /**
     * Constructor for Message Controller
     * @param {IMessageService} messageService - Instance of message service
     */
    constructor(messageService: IMessageService) {
        this.messageService = messageService;
    }

    /**
     * Retrieves the list of messages for a chat with id `chatId`.
     * @param req - The express request object containing the chat id in the request body.
     * @param res - The express response object used to send the list of messages.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the message list retrieval process is complete.
     */
    async getMessages(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { chatId } = req.params;

            const data = await this.messageService.getMessages(chatId);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err) {
            next(err);
        }
    }
}
