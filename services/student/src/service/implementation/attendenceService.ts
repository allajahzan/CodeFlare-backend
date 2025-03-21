import { BadRequestError } from "@codeflare/common";
import { ICheckInOutDto } from "../../dto/attendenceService";
import { IAttendenceRepository } from "../../repository/interface/IAttendenceRepository";
import { IAttendenceService } from "../interface/IAttendenceService";

/** Implementation of Attendence Service */
export class AttendenceService implements IAttendenceService {
    private attendenceRepository: IAttendenceRepository;

    /**
     * Constructor for Attendence Service
     * @param {IAttendenceRepository} attendenceRepository instance of attendence repository
     */
    constructor(attendenceRepository: IAttendenceRepository) {
        this.attendenceRepository = attendenceRepository;
    }

    /**
     * Check In/Out a student
     * @param {string} userId - Id of the student
     * @param {string} activity - "checkIn" or "checkOut"
     * @returns {Promise<ICheckInOutDto>} - The updated attendence document
     * @throws {BadRequestError} - If update fails
     */
    async checkInOut(userId: string, activity: string): Promise<ICheckInOutDto> {
        try {
            const attendence = await this.attendenceRepository.update(
                { userId },
                {
                    $set:
                        activity === "checkIn"
                            ? { checkIn: new Date() }
                            : { checkOut: new Date() },
                },
                { new: true }
            );

            if (!attendence)
                throw new BadRequestError("CheckIn failed due to some issue!");

            // Map data to return type
            const checkInOut: ICheckInOutDto = {
                userId,
                date: attendence.date,
                ...(activity === "checkIn"
                    ? { checkIn: attendence.checkIn }
                    : { checkOut: attendence.checkOut }),
                status: attendence.status,
            };

            return checkInOut;
        } catch (err: unknown) {
            throw err;
        }
    }
}
