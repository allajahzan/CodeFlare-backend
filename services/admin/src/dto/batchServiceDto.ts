import { Schema } from "mongoose";

/** Dto for batch */
export interface IBatchDto {
    _id: Schema.Types.ObjectId;
    name: string;
}
