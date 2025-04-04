import { Request, Response, NextFunction } from "express";
import { IMeetService } from "../../service/interface/IMeetService";
import { IMeetController } from "../interface/IMeetController";
import { ResponseMessage, SendResponse } from "@codeflare/common";
import { HttpStatusCode } from "axios";

/** Implementation of Meet Controller */
export class MeetController implements IMeetController {
    private meetService: IMeetService;

    /**
     * Constructs a new instance of the MeetController.
     * @param {IMeetService} meetService - The service used for managing meet operations.
     */
    constructor(meetService: IMeetService) {
        this.meetService = meetService;
    }

    /**
     * Retrieves a meet document by its ID from the query parameters.
     * @param {Request} req - The express request object containing the meet id in the query parameters.
     * @param {Response} res - The express response object used to send the meet document if found.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the meet document is successfully retrieved and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware if the retrieval fails.
     */
    async getMeetById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id: _id } = req.query;

            const meet = await this.meetService.getMeetById(_id as string);
            SendResponse(res, HttpStatusCode.Ok, ResponseMessage.SUCCESS, meet);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Creates a new meet document with the specified host ID.
     * @param {Request} req - The express request object containing the host ID in the request body.
     * @param {Response} res - The express response object used to send the created meet document.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the meet document is successfully created and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware if the creation fails.
     */
    async createMeet(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { hostId } = req.body;
            
            const meet = await this.meetService.createMeet(hostId);
            SendResponse(res, HttpStatusCode.Ok, ResponseMessage.SUCCESS, meet);
        } catch (err: unknown) {
            next(err);
        }
    }
}
