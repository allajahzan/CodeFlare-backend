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
        studentId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        batchId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        domainId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        weekId: {
            type: Schema.Types.ObjectId,
            index: true,
        },
        title: {
            type: String,
        },
        date: {
            type: Date,
        },
        time: {
            type: String,
        },
        category: {
            type: String,
            enum: ["Foundation", "Weekly", "QA", "InTake", "Normal"],
        },
        feedback: {
            type: String,
        },
        pendings: {
            type: [String],
        },
        score: {
            type: {
                practical: {
                    type: Number,
                },
                theory: {
                    type: Number,
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
        rating: {
            type: Number,
        },
    },
    { timestamps: true }
);

const Review = model<IReviewSchema>("Review", reviewSchema);
export default Review;
