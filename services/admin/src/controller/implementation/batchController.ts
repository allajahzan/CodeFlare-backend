import { Request, Response, NextFunction } from "express";
import { IBatchService } from "../../service/interface/IBatchService";
import { IBatchController } from "../interface/IBatchController";
import {
    HTTPStatusCode,
    JwtPayloadType,
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
            const { type } = req.query;

            const data = await this.batchService.getBatches(type as string);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
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

            const data = await this.batchService.addBatch(name);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the name of a batch with the given batchId.
     * @param req - The express request object containing the batchId of the batch to update in the request parameters, and the new name in the request body.
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
            const { batchId } = req.params;
            const { name } = req.body;

            await this.batchService.updateBatch(batchId, name);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Searches for batches based on the given keyword from the request query.
     * @param req - The express request object containing the keyword, sort and order in the request query.
     * @param res - The express response object used to send the list of batches.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the batch search process is complete.
     * @throws An error if there is a problem searching for the batches.
     */
    async searchBatches(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { keyword, sort, order } = req.query;

            const data = await this.batchService.searchBatches(
                keyword as string,
                sort as string,
                Number(order)
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
