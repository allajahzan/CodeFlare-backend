import { Request, Response, NextFunction } from "express";
import { IReviewService } from "../../service/interface/IReviewService";
import { IReviewController } from "../interface/IReviewController";
import {
    HTTPStatusCodes,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of Review Controller */
export class ReviewController implements IReviewController {
    private reviewService: IReviewService;

    /**
     * Constructs an instance of the ReviewController.
     * @param reviewService - The service used for managing review data.
     */
    constructor(reviewService: IReviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Schedules a review for a user.
     * @param req - The request containing the review data.
     * @param res - The response to send the review data back to the user.
     * @param next - The next middleware function to call in case of an error.
     * @returns A promise that resolves when the review has been scheduled.
     * @throws An error if there is a problem scheduling the review.
     */
    async scheduleReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const reviewData = req.body;

            const data = await this.reviewService.scheduleReview(reviewData);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates a review for a user.
     * @param req - The express request object containing the review id in params and the review data in body.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the review has been updated.
     * @throws An error if there is a problem updating the review.
     */
    async updateReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { reviewId } = req.params;
            const reviewData = req.body;

            const data = await this.reviewService.updateReview(reviewData, reviewId);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
