import { model, Schema } from "mongoose";
import { IReviewSchema } from "../entities/IReviewSchema";

/** Implementaion of Review Schema */
const reviewSchema = new Schema<IReviewSchema>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    week: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: false,
    },
    feedback: {
        type: String,
        required: false,
    },
    pendings: {
        type: [String],
        required: false,
    },
    score: {
        tech: {
            type: Number,
            required: false,
        },
        theory: {
            type: Number,
            required: false,
        },
    },
});

const Review = model<IReviewSchema>("Review", reviewSchema);
export default Review;
