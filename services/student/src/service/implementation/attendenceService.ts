import { BadRequestError, NotFoundError } from "@codeflare/common";
import { ICheckInDto, ICheckOutDto } from "../../dto/attendenceService";
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
     * Check in for the user
     * @param {string} userId unique id of the user
     * @returns {Promise<ICheckInDto>} Promise that resolves to an object containing the user's check in details
     * @throws {NotFoundError} If no user is found with the given userId
     * @throws {BadRequestError} If the checkIn fails due to some other issue
     */
    async checkIn(userId: string): Promise<ICheckInDto> {
        try {
            const attendence = await this.attendenceRepository.update(
                { userId },
                { $set: { checkIn: new Date() } },
                { new: true }
            );

            if (!attendence)
                throw new BadRequestError("CheckIn failed due to some issue!");

            // Map data to return type
            const checkInDto: ICheckInDto = {
                userId,
                date: attendence.date,
                checkIn: attendence.checkIn,
                status: attendence.status,
            };

            return checkInDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Check out for the user
     * @param {string} userId - Unique id of the user
     * @returns {Promise<ICheckOutDto>} Promise that resolves to an object containing the user's check out details
     * @throws {BadRequestError} If the checkOut fails due to some issue
     */
    async checkOut(userId: string): Promise<ICheckOutDto> {
        try {
            const attendence = await this.attendenceRepository.update(
                { userId },
                { $set: { checkOut: new Date() } },
                { new: true }
            );

            if (!attendence)
                throw new BadRequestError("CheckOut failed due to some issue!");

            // Map data to return type
            const checkOutDto: ICheckOutDto = {
                userId,
                date: attendence.date,
                checkOut: attendence.checkOut,
                status: attendence.status,
            };

            return checkOutDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
