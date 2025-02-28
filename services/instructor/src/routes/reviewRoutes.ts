import { NextFunction, Request, Response, Router } from "express";
import { ReviewController } from "../controller/implementation/reviewController";
import { ReviewService } from "../service/implementation/reviewService";
import { ReviewRepository } from "../repository/implementation/reviewRepository";
import Review from "../schema/reviewSchema";

const router = Router();

// Dependency Injuction
const reviewRepository = new ReviewRepository(Review);
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService);

// Get Schedule review
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    reviewController.getScheduledReviews(req, res, next)
);

// Schedule review
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    reviewController.scheduleReview(req, res, next)
);

// Update review
router.patch("/", (req: Request, res: Response, next: NextFunction) =>
    reviewController.updateReview(req, res, next)
);

// Search reviews
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
    reviewController.searchReviews(req, res, next)
);

export { router as reviewRoute };
