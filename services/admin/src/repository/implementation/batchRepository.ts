import { BaseRepository } from "@codeflare/common";
import { IBatchSchema } from "../../entities/IBatchSchema";
import { Model } from "mongoose";
import { IBatchRepository } from "../interface/IBatchRepository";

/** Implementation of Batch Repository */
export class BatchRepository extends BaseRepository<IBatchSchema> implements IBatchRepository {
    /**
     * Constructs an instance of the BatchRepository
     * @param model - The Mongoose model for the BatchSchema
     */
    constructor(model: Model<IBatchSchema>) {
        super(model);
    }
}
