import { Document } from "mongoose";

/** Inteface for Batch Schema */
export interface IBatchSchema extends Document {
    name: string;
}
