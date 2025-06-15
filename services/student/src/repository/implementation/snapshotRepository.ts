import { BaseRepository } from "@codeflare/common";
import { ISnapshotSchema } from "../../entities/ISnapshot";
import { ISnapshotRepository } from "../interface/ISnapshotRepository";
import { Model } from "mongoose";

/** Implementation of Snapshot Repository */
export class SnapshotRepository
    extends BaseRepository<ISnapshotSchema>
    implements ISnapshotRepository {
    /**
     * Constructs an instance of SnapshotRepository.
     * @param model - The Mongoose model for the Snapshot schema.
     */
    constructor(model: Model<ISnapshotSchema>) {
        super(model);
    }
}
