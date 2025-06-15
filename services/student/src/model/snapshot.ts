import { model, Schema } from "mongoose";
import { ISnapshotSchema } from "../entities/ISnapshot";

/** Implementation of Snapshot Schema */
const snapshotSchema = new Schema<ISnapshotSchema>(
    {
        attendenceId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        time: {
            type: String,
            required: false,
        },
        photo: {
            type: String,
            required: false,
        },
        location: {
            type: String,
            required: false,
        },
        expireAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            index: { expires: 0 },
        },
    },
    { timestamps: true }
);

const Snapshot = model("Snapshot", snapshotSchema);
export default Snapshot;
