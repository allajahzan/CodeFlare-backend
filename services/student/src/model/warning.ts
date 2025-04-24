import { model, Schema } from "mongoose";
import { IWarningSchema } from "../entities/IWarning";

/** Implementation of Warning Schema */
const WarningSchema = new Schema<IWarningSchema>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        coordinatorId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        reply: {
            message: { type: String },
            repliedAt: { type: Date },
        },
    },
    { timestamps: true }
);

// Ensure one warning per student per date
// WarningSchema.index({ studentId: 1, date: 1 }, { unique: true });
export const Warning = model<IWarningSchema>("Warning", WarningSchema);
