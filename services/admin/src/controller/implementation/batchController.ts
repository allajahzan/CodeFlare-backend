import { Request, Response, NextFunction } from "express";
import { IBatchService } from "../../service/interface/IBatchService";
import { IBatchController } from "../interface/IBatchController";
import {
    HTTPStatusCodes,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of Batch Controller */
export class BatchController implements IBatchController {
    private batchService: IBatchService;

    /**
     * Constructs an instance of the BatchController
     * @param batchService - The batch service to use for performing operations on batches.
     */
    constructor(batchService: IBatchService) {
        this.batchService = batchService;
    }

    /**
     * Retrieves the list of batches.
     * @param req - The express request object.
     * @param res - The express response object used to send the list of batches.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the batch list retrieval process is complete.
     */
    async getBatches(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.batchService.getBatches();

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Adds a new batch with the specified name from the request body.
     * @param req - The express request object containing the batch name in the body.
     * @param res - The express response object used to send a success response.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the batch is added successfully.
     * @throws An error if there is a problem adding the batch.
     */
    async addBatch(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { name } = req.body;

            await this.batchService.addBatch(name);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the name of a batch with the given id.
     * @param req - The express request object containing the id of the batch to update in the request parameters, and the new name in the request body.
     * @param res - The express response object used to send the response.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the batch is updated successfully.
     * @throws An error if there is a problem updating the batch.
     */
    async updateBatch(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const { name } = req.body;

            await this.batchService.updateBatch(id, name);

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }
}
