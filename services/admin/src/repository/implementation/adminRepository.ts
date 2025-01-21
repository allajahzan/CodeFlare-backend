import { BaseRepository } from "@codeflare/common";
import { IAdminSchema } from "../../entities/IAdminSchema";
import { Model } from "mongoose";
import { IAdminRepostory } from "../interface/IAdminRepository";

/** Implementation of Admin Repository */
export class AdminRepositoty extends BaseRepository<IAdminSchema> implements IAdminRepostory {
    /**
     * Constructs an instance of AdminRepository.
     * @param model - The mongoose model representing the admin schema, used for database operations.
     */
    constructor(model: Model<IAdminSchema>) {
        super(model);
    }
}
