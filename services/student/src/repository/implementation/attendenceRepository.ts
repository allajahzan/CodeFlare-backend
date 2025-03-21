import { BaseRepository } from "@codeflare/common";
import { IAttendenceRepository } from "../interface/IAttendenceRepository";
import { FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";
import { IAttendenceSchema } from "../../entities/IAttendence";

/** Implementation of Attendence Repository */
export class AttendenceRepository extends BaseRepository<IAttendenceSchema> implements IAttendenceRepository {
    /**
     * Constructor for Attendence Repository
     * @param {Model<IAttendenceSchema>} model instance of mongoose model
     */
    constructor(model: Model<IAttendenceSchema>) {
        super(model)
    }
}