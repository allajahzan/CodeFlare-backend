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
        index: 1,
    },
    checkIn: {
        type: String,
        default: null
    },
    checkOut: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["Pending", "Present", "Absent", "Late"],
        default: "Pending",
    },
    isApproved: {
        type: Boolean,
        required: false,
        default: false
    },
    isPartial: {
        type: Boolean,
        required: false,
        default: false,
    },
    reason: {
        type: {
            time: {
                type: String,
                required: false,
            },
            description: {
                type: String,
                required: false,
            },
        },
        default: {}
    },
    selfies: {
        type : [
            {
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
                isVerified: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        default: []
    },
});

const Attendence = model("Attendence", attendenceSchema);
export default Attendence;
