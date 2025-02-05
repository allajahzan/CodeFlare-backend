import { NextFunction, Request, Response, Router } from "express";
import { ChatController } from "../controller/implementation/chatController";
import { ChatService } from "../service/implementation/chatService";
import { ChatRepository } from "../repository/implementation/chatRepository";
import Chat from "../model/chatSchema";

const router = Router();

// Dependecy Injuction
const chatRepository = new ChatRepository(Chat);
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

// Get chats
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    chatController.getChats(req, res, next)
);

export { router as chatRoute };
