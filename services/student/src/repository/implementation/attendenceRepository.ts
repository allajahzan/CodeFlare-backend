import { BaseRepository } from "@codeflare/common";
import { IAttendenceRepository } from "../interface/IAttendenceRepository";
import { Model } from "mongoose";
import { IAttendenceSchema } from "../../entities/IAttendence";

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
            console.error("Error inserting attendances:", err);
            return null;
        }
    }
}
