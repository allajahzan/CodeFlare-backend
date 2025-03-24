import { BadRequestError } from "@codeflare/common";
import { ICheckInOutDto } from "../../dto/attendenceService";
import { IAttendenceRepository } from "../../repository/interface/IAttendenceRepository";
import { IAttendenceService } from "../interface/IAttendenceService";
import { ObjectId } from "mongoose";
import { IAttendenceSchema } from "../../entities/IAttendence";
import { getUsers } from "../../grpc/client/userClient";
import { getCachedBatch } from "../../utils/cachedBatches";

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

            console.log(isAttendenceExist);

            // No such attendence registered by cronjob
            if (!isAttendenceExist) {
                throw new BadRequestError(
                    `${activity === "checkIn" ? "CheckIn" : "CheckOut"
                    } failed due to some issue!`
                );
            }

            // If already checked In or checked Out
            if (
                (activity === "checkIn" && isAttendenceExist.checkIn) ||
                (activity === "checkOut" && isAttendenceExist.checkOut)
            ) {
                throw new BadRequestError(
                    `You have already ${activity === "checkIn" ? "checked In" : "checked Out"
                    }!`
                );
            }

            // Check weather student crossed more thatn 8 hours
            if (activity === "checkOut") {
                if (!isAttendenceExist.checkIn) {
                    throw new BadRequestError("You didn't even check-in to check-out!");
                }

                const currentHour = new Date().getMinutes();
                const checkedInHour = new Date(isAttendenceExist.checkIn).getMinutes();
                if (currentHour - checkedInHour < 30) {
                    throw new BadRequestError(
                        "You can't check out now, you have to sit maximum of 30 Minutes!"
                    );
                }
            }

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

    /**
     * Retrieves the attendence records for the given user and batchIds if provided
     * @param {string} userId - The ID of the user to retrieve attendence for
     * @param {string[]} batchIds - The IDs of the batches to retrieve attendence for
     * @returns {Promise<IAttendenceSchema[] | []>} - A promise that resolves to an array of attendence records
     * if the operation is successful, an empty array otherwise.
     * @throws - Passes any errors to the caller
     */
    async getAttendence(
        userId: string,
        batchIds: string[]
    ): Promise<IAttendenceSchema[] | []> {
        try {
            // Find attendece
            let attendences = await this.attendenceRepository.find({
                ...(batchIds ? { batchId: { $in: batchIds } } : {}),
                ...(userId ? { userId } : {}),
            });

            const userIds = []; // UserIds

            for (let i = 0; i < attendences.length; i++) {
                userIds.push(...[attendences[i].userId as unknown as string]);
            }

            // Users info through gRPC
            let usersMap: Record<
                string,
                {
                    _id: string;
                    name: string;
                    email: string;
                    role: string;
                    profilePic: string;
                    batch: any;
                }
            >;

            const resp = await getUsers([...new Set(userIds)]);

            // Success response from gRPC
            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            } else {
                throw new BadRequestError(resp.response.message);
            }

            // Fetch batch details and user detils
            const attendencesWithUserAndBatch = await Promise.all(
                attendences.map(async (attendance) => ({
                    ...attendance.toObject(),
                    user: usersMap[attendance.userId.toString()],
                    batch: await getCachedBatch(attendance.batchId), // Fetch batch details from Redis
                }))
            );

            return attendencesWithUserAndBatch;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Searches for attendance records for a student based on user ID, batch IDs, and date.
     * @param {string} userId - The ID of the user to search for attendence records
     * @param {string[]} batchIds - The IDs of the batches to search for attendence records
     * @param {string} date - The date to search for attendence records
     * @returns {Promise<IAttendenceSchema[] | []>} - The attendance records if found, empty array otherwise
     * @throws - Passes any errors to the caller
     */
    async searchAttendece(
        userId: string,
        batchIds: string[],
        date: string
    ): Promise<IAttendenceSchema[] | []> {
        try {
            const attendences = await this.attendenceRepository.searchAttendence(
                userId,
                batchIds,
                date
            );

            if (!attendences || !attendences.length) return [];

            const userIds = []; // UserIds

            for (let i = 0; i < attendences.length; i++) {
                userIds.push(...[attendences[i].userId as unknown as string]);
            }

            // Users info through gRPC
            let usersMap: Record<
                string,
                {
                    _id: string;
                    name: string;
                    email: string;
                    role: string;
                    profilePic: string;
                    batch: any;
                }
            >;

            const resp = await getUsers([...new Set(userIds)]);

            // Success response from gRPC
            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            } else {
                throw new BadRequestError(resp.response.message);
            }

            // Fetch batch details and user detils
            const attendencesWithUserAndBatch = await Promise.all(
                attendences.map(async (attendance) => ({
                    ...(attendance.toObject ? attendance.toObject() : attendance),
                    user: usersMap[attendance.userId.toString()],
                    batch: await getCachedBatch(attendance.batchId), // Fetch batch details from Redis
                }))
            );

            return attendencesWithUserAndBatch;
        } catch (err: unknown) {
            throw err;
        }
    }
}
