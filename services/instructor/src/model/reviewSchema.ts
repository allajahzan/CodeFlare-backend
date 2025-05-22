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
        category: {
            type: String,
            enum: ["Foundation", "Weekly", "QA", "InTake"],
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
        rating: {
            type: Number,
            required: false,
        },
    },
    { timestamps: true }
);

const Review = model<IReviewSchema>("Review", reviewSchema);
export default Review;
