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
     * Searches for attendance records based on user ID, batch IDs, date, and additional filters.
     * @param {string} userId - The ID of the user to search for attendance records.
     * @param {string[]} batchIds - A list of batch IDs to filter attendance records.
     * @param {string} date - The date to search for attendance records in "YYYY-MM-DD" format.
     * @param {string} sort - The field by which to sort the results.
     * @param {number} order - The order of sorting: 1 for ascending, -1 for descending.
     * @param {string} filter - Additional filter for the status of attendance records.
     * @returns {Promise<IAttendenceSchema[] | null>} - A promise that resolves to an array of attendance records if found, null otherwise.
     * @throws - Returns null in the event of an error.
     */
    async searchAttendence(
        userId: string,
        batchIds: string[],
        date: string,
        sort: string,
        order: number,
        filter: string
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
                        ...(filter && { status: filter }),
                    },
                },
                // {
                //     $sort: sort ? { [sort]: order === 1 ? 1 : -1 } : { checkIn: -1 },
                // },
            ]);

            return attendence.length ? attendence : null;
        } catch (err: unknown) {
            return null;
        }
    }
}
