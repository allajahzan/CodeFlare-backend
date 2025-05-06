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
     * @param {FilterQuery<IAttendenceSchema>} filter - Filter for the lists to update
     * @param {UpdateQuery<IAttendenceSchema>} update - Updates to apply to the lists
     * @returns {Promise<UpdateWriteOpResult | null>} - The result of the update operation if successful, null otherwise
     */
    async updateMany(
        filter: FilterQuery<IAttendenceSchema>,
        update: UpdateQuery<IAttendenceSchema>
    ): Promise<UpdateWriteOpResult | null> {
        try {
            return await this.model.updateMany(filter, update);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Searches for attendance lists based on user ID, batch IDs, date, and additional filters.
     * @param {string} userId - The ID of the user to search for attendance lists.
     * @param {string[]} batchIds - A list of batch IDs to filter attendance lists.
     * @param {string} date - The date to search for attendance lists in "YYYY-MM-DD" format.
     * @param {string} sort - The field by which to sort the results.
     * @param {number} order - The order of sorting: 1 for ascending, -1 for descending.
     * @param {string} filter - Additional filter for the status of attendance lists.
     * @returns {Promise<IAttendenceSchema[] | null>} - A promise that resolves to an array of attendance lists if found, null otherwise.
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
            return await this.model.aggregate([
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
            ]);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Retrieves a monthly overview of attendance records based on user ID, batch IDs, month, year, and additional filters.
     * @param {string} userId - The ID of the user to retrieve attendance records for.
     * @param {string[]} batchIds - A list of batch IDs to filter attendance records.
     * @param {string} month - The month to retrieve attendance records for.
     * @param {number} year - The year to retrieve attendance records for.
     * @param {string} filter - Additional filter criteria for attendance status.
     * @returns {Promise<IAttendenceSchema[] | null>} - A promise that resolves to an array of attendance records if found, null otherwise.
     * @throws - Returns null in the event of an error.
     */
    async getMonthlyOverview(
        userId: string,
        batchIds: string[],
        month: number,
        year: number,
        filter: string,
        skip: number,
        limit: number
    ): Promise<IAttendenceSchema[] | null> {
        try {
            return await this.model.aggregate([
                {
                    $match: {
                        ...(batchIds.length && {
                            batchId: { $in: batchIds.map((id) => new Types.ObjectId(id)) },
                        }),
                        ...(userId && { userId: new Types.ObjectId(userId) }),
                        ...(month && year
                            ? {
                                $expr: {
                                    $and: [
                                        { $eq: [{ $year: "$date" }, year] },
                                        { $eq: [{ $month: "$date" }, month] },
                                    ],
                                },
                            }
                            : {}),
                        ...(filter && { status: filter }),
                    },
                },
                {
                    $sort: {
                        date: -1,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ]);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Retrieves a list of students who have been flagged for attendance issues (absent or late) more than once in the given month and year.
     * @param {string} userId - The ID of the user to retrieve attendance records for.
     * @param {string[]} batchIds - A list of batch IDs to filter attendance records.
     * @param {string} month - The month to retrieve attendance records for.
     * @param {number} year - The year to retrieve attendance records for.
     * @param {string} filter - Additional filter criteria for attendance status.
     * @returns {Promise<IAttendenceSchema[] | null>} - A promise that resolves to an array of attendance records if found, null otherwise.
     * @throws - Returns null in the event of an error.
     */
    async getDefaulters(
        userId: string,
        batchIds: string[],
        month: number,
        year: number,
        filter: string,
        skip: number,
        limit: number
    ): Promise<IAttendenceSchema[] | null> {
        try {
            return await this.model.aggregate([
                {
                    $match: { status: { $in: ["Absent", "Late"] } },
                },
                {
                    $match: {
                        ...(batchIds.length && {
                            batchId: { $in: batchIds.map((id) => new Types.ObjectId(id)) },
                        }),
                        ...(userId && { userId: new Types.ObjectId(userId) }),
                        ...(month && year
                            ? {
                                $expr: {
                                    $and: [
                                        { $eq: [{ $year: "$date" }, year] },
                                        { $eq: [{ $month: "$date" }, month] },
                                    ],
                                },
                            }
                            : {}),
                        ...(filter && { status: filter }),
                    },
                },
                {
                    $group: {
                        _id: { userId: "$userId", batchId: "$batchId", status: "$status" },
                        count: { $sum: 1 },
                        records: { $push: "$$ROOT" },
                    },
                },
                {
                    $match: {
                        count: { $gte: 2 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        userId: "$_id.userId",
                        batchId: "$_id.batchId",
                        status: "$_id.status",
                        count: 1,
                        records: 1,
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ]);
        } catch (err: unknown) {
            return null;
        }
    }
}
