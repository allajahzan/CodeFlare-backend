import { model, Schema } from "mongoose";
import { IWeekSchema } from "../entities/IWeekSchema";

/** Implementation for Week Schema */
const weekSchema = new Schema<IWeekSchema>(
    {
        name: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Week = model<IWeekSchema>("Week", weekSchema);
export default Week;
