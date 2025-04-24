import { BaseRepository } from "@codeflare/common";
import { IWarningSchema } from "../../entities/IWarning";
import { IWarningRepository } from "../interface/IWarningRepository";
import { Model } from "mongoose";

/** Implementation of Warning Repository */
export class WarningRepository
    extends BaseRepository<IWarningSchema>
    implements IWarningRepository {
    /**
     * Constructs an instance of WarningRepository.
     * @param model - The Mongoose model for the Warning schema.
     */
    constructor(model: Model<IWarningSchema>) {
        super(model);
    }

    /**
     * Creates a new warning in the database using the provided data.
     * @param warning - Warning data to be created.
     * @returns A promise that resolves to the newly created warning document if successful, otherwise null.
     */
    async createWarning(warning: IWarningSchema): Promise<IWarningSchema | null> {
        try {
            return await this.model.create(warning);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Replies to a warning in the database using the provided data.
     * @param warningId - The ID of the warning to which the reply is to be added.
     * @param reply - The reply to be added to the warning.
     * @returns A promise that resolves to the updated warning document if successful, otherwise null.
     */
    async replyToWarning(
        warningId: string,
        reply: string
    ): Promise<IWarningSchema | null> {
        try {
            return await this.model.findOneAndUpdate(
                { _id: warningId },
                { $set: { "reply.message": reply, "reply.date": new Date() } },
                { new: true }
            );
        } catch (err: unknown) {
            return null;
        }
    }
}
