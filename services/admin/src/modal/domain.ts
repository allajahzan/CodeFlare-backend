import { model, Schema } from "mongoose";
import { IDomainSchema } from "../entities/IDomainSchema";

/** Implementation of Domain Schema */
const domainSchema = new Schema<IDomainSchema>(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        domainsWeeks: {
            type: [
                {
                    week: {
                        type: Schema.Types.ObjectId,
                        required: true,
                        ref: "Week",
                        index: true,
                    },
                    title: {
                        type: String,
                        required: true,
                    },
                    isWeekListed: {
                        type: Boolean,
                        default: true,
                    },
                },
            ],
            required: true,
        },
        isDomainListed: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Domain = model<IDomainSchema>("Domain", domainSchema);
export default Domain;
