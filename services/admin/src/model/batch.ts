import { model, Schema } from "mongoose";
import { IBatchSchema } from "../entities/IBatchSchema";

/** Implementation for Admin Schema */
const batchSchema = new Schema<IBatchSchema>(
    {
        name: {
            type: String,
            required: true,
            index: true
        },
    },
    { timestamps: true }
);

const Batch = model<IBatchSchema>("Batch", batchSchema);
export default Batch;
