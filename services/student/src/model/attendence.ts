import { model, Schema } from "mongoose";
import { IAttendenceSchema } from "../entities/IAttendence";

/** Implementation of Attendence Schema */
const attendenceSchema = new Schema<IAttendenceSchema>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        default: new Date(),
        index: 1,
    },
    checkIn: {
        type: Date,
        required: false,
        index: true,
    },
    checkOut: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ["Pending", "Late", "Present", "Absent", "Partial"],
        default: "Pending",
    },
    isApproved: {
        type: Boolean,
        required: false,
    },
    isPartial: {
        type: Boolean,
        required: false,
        default: false,
    },
    reason: {
        time: {
            type: Date,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
    },
    selfies: [
        {
            name: {
                type: String,
                required: true,
            },
            time: {
                type: Date,
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
            isVerified: {
                type: Boolean,
                default: false,
            },
        },
    ],
});

const Attendence = model("Attendence", attendenceSchema);
export default Attendence;
