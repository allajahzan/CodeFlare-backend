import { BaseRepository } from "@codeflare/common";
import { IWarningSchema } from "../../entities/IWarning";
import { IWarningRepository } from "../interface/IWarningRepository";
import { Model, Types } from "mongoose";

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
     * Retrieves the list of warnings for a student with the given student ID and in the given month and year.
     * @param studentId - The ID of the student to retrieve warnings for.
     * @param month - The month to retrieve warnings for.
     * @param year - The year to retrieve warnings for
     * @returns A promise that resolves to the list of warnings as IWarningSchema
     * objects, or null if no warnings are found.
     */
    async getWarnings(
        studentId: string,
        month: number,
        year: number
    ): Promise<IWarningSchema[] | null> {
        try {
            const warnings = await this.model.aggregate([
                {
                    $match: {
                        studentId: new Types.ObjectId(studentId),
                        ...(month &&
                            year && {
                            $expr: {
                                $and: [
                                    { $eq: [{ $year: "$date" }, year] },
                                    { $eq: [{ $month: "$date" }, month] },
                                ],
                            },
                        }),
                    },
                },
                {
                    $sort: { date: -1 },
                },
            ]);

            return warnings.length ? warnings : null;
        } catch (err: unknown) {
            return null;
        }
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
