import { model, Schema } from "mongoose";
import { IAttendenceSchema } from "../entities/IAttendence";

/** Implementation of Attendence Schema */
const attendenceSchema = new Schema<IAttendenceSchema>({
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
    date: {
        type: Date,
        default: new Date(),
        index: true,
    },
    checkIn: {
        type: String,
        default: null,
    },
    checkOut: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["Pending", "Present", "Absent", "Late"],
        default: "Pending",
    },
    isApproved: {
        type: Boolean,
        default: null,
    },
    reason: {
        type: {
            time: {
                type: String,
            },
            description: {
                type: String,
            },
        },
        default: {},
    },
    report: {
        type: {
            time: {
                type: String,
            },
            description: {
                type: String,
            },
        },
        default: {},
    },
    selfies: {
        type: [Boolean],
        default: [false, false, false],
    },
});

const Attendence = model("Attendence", attendenceSchema);
export default Attendence;
