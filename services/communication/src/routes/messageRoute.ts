import { NextFunction, Request, Response, Router } from "express";
import { ChatController } from "../controller/implementation/chatController";
import { ChatService } from "../service/implementation/chatService";
import { ChatRepository } from "../repository/implementation/chatRepository";
import Chat from "../model/chatSchema";
import { MessageController } from "../controller/implementation/messageController";
import { MessageService } from "../service/implementation/messageService";
import { MessageRepository } from "../repository/implementation/messageRepository";
import Message from "../model/messageSchema";

const router = Router();

// Dependecy Injuction
const messageRepository = new MessageRepository(Message);
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);

// Get messages
router.get("/:chatId", (req: Request, res: Response, next: NextFunction) =>
    messageController.getMessages(req, res, next)
);

export { router as messageRoute };
