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
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59

            // Find attendence of today's with time range
            const isAttendenceExist = await this.attendenceRepository.findOne({
                userId,
                date: { $gte: startOfDay, $lte: endOfDay },
            });

            // No such attendence registered by cronjob
            if (!isAttendenceExist) {
                throw new BadRequestError(
                    `${activity === "checkIn" ? "CheckIn" : "CheckOut"
                    } failed due to some issue!`
                );
            }

            // If already checked In or checked Out
            if (isAttendenceExist.checkIn || isAttendenceExist.checkOut) {
                throw new BadRequestError(
                    `You have already ${activity === "checkIn" ? "checked In" : "checked Out"
                    }!`
                );
            }

            // Check weather student crossed more thatn 8 hours
            const currentHour = new Date().getHours()
            

            // Update attendence
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
                throw new BadRequestError(
                    `${activity === "checkIn" ? "CheckIn" : "CheckOut"
                    } failed due to some issue!`
                );

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
