import { Document, Schema } from "mongoose";

// Interface for domains week
export interface IDomainsWeekSchema {
    week: Schema.Types.ObjectId;
    title: string;
}

/** Implementation of Domain Schema */
export interface IDomainSchema extends Document {
    name: string;
    domainsWeeks: IDomainsWeekSchema[];
    isListed: boolean;
}
