import { BaseRepository } from "@codeflare/common";
import { IAttendenceRepository } from "../interface/IAttendenceRepository";
import { Model, Types, UpdateWriteOpResult } from "mongoose";
import { IAttendenceSchema } from "../../entities/IAttendence";
import { FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

/** Implementation of Attendence Repository */
export class AttendenceRepository
    extends BaseRepository<IAttendenceSchema>
    implements IAttendenceRepository {
    /**
     * Constructor for Attendence Repository
     * @param {Model<IAttendenceSchema>} model instance of mongoose model
     */
    constructor(model: Model<IAttendenceSchema>) {
        super(model);
    }

    /**
     * Inserts multiple attendances into the database
     * @param {Omit<IAttendenceSchema, "_id">[]} data - Array of attendence objects to insert
     * @returns {Promise<IAttendenceSchema[] | null>} - The inserted attendences if insertion was successful, null otherwise
     */
    async insertMany(
        data: Partial<Record<keyof IAttendenceSchema, any>>[]
    ): Promise<IAttendenceSchema[] | null> {
        try {
            const insertedAttendances = await this.model.insertMany(data, {
                rawResult: false,
            });

            return insertedAttendances.map((doc) =>
                doc.toObject()
            ) as IAttendenceSchema[];
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Updates multiple attendances in the database
     * @param {FilterQuery<IAttendenceSchema>} filter - Filter for the records to update
     * @param {UpdateQuery<IAttendenceSchema>} update - Updates to apply to the records
     * @returns {Promise<UpdateWriteOpResult | null>} - The result of the update operation if successful, null otherwise
     */
    async updateMany(
        filter: FilterQuery<IAttendenceSchema>,
        update: UpdateQuery<IAttendenceSchema>
    ): Promise<UpdateWriteOpResult | null> {
        try {
            const attendence = await this.model.updateMany(filter, update);
            return attendence;
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Searches for attendance records for a student based on user ID, batch IDs, and date.
     * @param {string} userId - The ID of the user to search for attendence records
     * @param {string[]} batchIds - The IDs of the batches to search for attendence records
     * @param {string} date - The date to search for attendence records
     * @returns {Promise<IAttendenceSchema[] | null>} - The attendance records if found, null otherwise
     * @throws - Passes any errors to the caller
     */
    async searchAttendence(
        userId: string,
        batchIds: string[],
        date: string
    ): Promise<IAttendenceSchema[] | null> {
        try {
            const attendence = await this.model.aggregate([
                {
                    $match: {
                        ...(batchIds.length && {
                            batchId: { $in: batchIds.map((id) => new Types.ObjectId(id)) },
                        }),
                        ...(userId && { userId: new Types.ObjectId(userId) }),
                        ...(date
                            ? {
                                $expr: {
                                    $eq: [
                                        { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                                        new Date(date).toISOString().split("T")[0],
                                    ],
                                },
                            }
                            : {}),
                    },
                },
            ]);

            return attendence.length ? attendence : null;
        } catch (err: unknown) {
            return null;
        }
    }
}
