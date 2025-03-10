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
     * Retrieves scheduled reviews for a given list of batchIds.
     * @param req - The express request object containing the list of batchIds in the request body.
     * @param res - The express response object used to send the list of scheduled reviews.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the scheduled review retrieval process is complete.
     * @throws An error if there is a problem retrieving the reviews.
     */
    async getScheduledReviews(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { userId } = req.query;

            const data = await this.reviewService.getScheduledReviews(
                userId as string
            );

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
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
            const tokenPayload = req.headers["x-user-payload"];

            const reviewData = req.body;

            const data = await this.reviewService.scheduleReview(
                tokenPayload as string,
                reviewData
            );
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
            const tokenPayload = req.headers["x-user-payload"];

            const { id: reviewId } = req.params;
            const reviewData = req.body;

            const data = await this.reviewService.updateReview(
                tokenPayload as string,
                reviewData,
                reviewId
            );
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Changes the status of a review with the given id.
     * @param req - The express request object containing the review id in params and the new status in the request body.
     * @param res - The express response object used to send the response.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the review status is updated successfully.
     * @throws An error if there is a problem updating the review status.
     */
    async changeStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const tokenPayload = req.headers["x-user-payload"];

            const { id: reviewId } = req.params;
            const { status } = req.body;

            await this.reviewService.changeStatus(
                tokenPayload as string,
                reviewId,
                status
            );
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the score of a review.
     * @param req - The express request object containing the review id in params and the score details in body.
     * @param res - The express response object used to send the response.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the review score is updated successfully.
     * @throws An error if there is a problem updating the review score.
     */
    async updateScore(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const tokenPayload = req.headers["x-user-payload"];

            const { id: reviewId } = req.params;
            const { practical, theory } = req.body;

            await this.reviewService.updateScore(
                tokenPayload as string,
                reviewId,
                practical,
                theory
            );
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Searches for reviews based on the given keyword from the request query.
     * @param req - The express request object containing the keyword, sort, order, status and batchIds in the request query.
     * @param res - The express response object used to send the list of reviews.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the review search process is complete.
     * @throws An error if there is a problem searching for the reviews.
     */
    async searchReviews(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { keyword, sort, order, date, status, batchIds, skip } = req.query;

            const data = await this.reviewService.searchReviews(
                keyword as string,
                sort as string,
                Number(order),
                date as string,
                status as string,
                (batchIds as string).split(","),
                Number(skip)
            );

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
