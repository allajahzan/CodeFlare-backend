import { Request, Response, NextFunction } from "express";
import { IChatController } from "../interface/IChatController";
import { HTTPStatusCodes, ResponseMessage, SendResponse } from "@codeflare/common";

/** Implementation for chat controller */
export class ChatController implements IChatController{
    private chatService: any;

    constructor(chatService: any){
        this.chatService = chatService
    }

    async getChats(req: Request, res: Response, next: NextFunction): Promise<void> {
       try{
            const { _id, email } = req.body;

            console.log(req.body);
            

       }catch(err){
        next(err)
       }
    }

    async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try{
            
        }catch(err){
            next(err)
        }
    }    
}