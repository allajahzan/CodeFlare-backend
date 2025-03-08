import { model, Schema } from "mongoose";
import { IReviewSchema } from "../entities/IReviewSchema";

/** Implementaion of Review Schema */
const reviewSchema = new Schema<IReviewSchema>(
    {
        instructorId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        batchId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        week: {
            type: String,
            required: true,
            index: true,
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
            type: {
                practical: {
                    type: Number,
                    required: false,
                },
                theory: {
                    type: Number,
                    required: false,
                },
            },
            default: null,  
        },
        status: {
            type: String,
            enum: ["Absent", "Pending", "Completed", "Cancelled"],
            default: "Pending",
        },
        result: {
            type: String,
            enum: ["Pass", "Fail"],
        },
    },
    { timestamps: true }
);

const Review = model<IReviewSchema>("Review", reviewSchema);
export default Review;
