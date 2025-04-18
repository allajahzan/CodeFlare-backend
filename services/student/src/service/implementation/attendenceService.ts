import { BadRequestError, NotFoundError } from "@codeflare/common";
import { ICheckInOutDto } from "../../dto/attendenceService";
import { IAttendenceRepository } from "../../repository/interface/IAttendenceRepository";
import { IAttendenceService } from "../interface/IAttendenceService";
import { ObjectId } from "mongoose";
import { IAttendenceSchema, ISelfie } from "../../entities/IAttendence";
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
    async checkInOut(
        userId: string,
        activity: string,
        time: string,
        reason: string
    ): Promise<ICheckInOutDto> {
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
                    `${activity === "checkIn" ? "Check-in" : "Check-out"
                    } failed due to some issue !`
                );
            }

            // If already checked In or checked Out
            if (
                (activity === "checkIn" && isAttendenceExist.checkIn) ||
                (activity === "checkOut" && isAttendenceExist.checkOut)
            ) {
                throw new BadRequestError(
                    `You have already ${activity === "checkIn" ? "checked-in " : "checked-out "
                    }!`
                );
            }

            // Current time
            const currentTime = new Date();
            const hour = currentTime.getHours();
            const minute = currentTime.getMinutes();

            // Check if Check-in is late or very late
            if (activity === "checkIn" && !reason) {
                if ((hour === 9 && minute >= 0) || (hour === 10 && minute === 0)) {
                    throw new Error("You are late to check-in. Please fill the reason !");
                } else if (hour > 10 || (hour === 10 && minute > 0)) {
                    throw new BadRequestError(
                        "You are very late. Please contact your coordinator !"
                    );
                }
            }

            // Check weather student crossed more than 8 hours
            if (activity === "checkOut") {
                if (!isAttendenceExist.checkIn) {
                    throw new BadRequestError("You didn't even check-in to check-out !");
                }

                const currentHour = new Date().getHours();
                const checkedInHour = Number(isAttendenceExist.checkIn.split(":")[0]);
                if (currentHour - checkedInHour < 8) {
                    throw new BadRequestError(
                        "You are not permitted to check-out right now !"
                    );
                }
            }

            // Update attendence
            const attendence = await this.attendenceRepository.update(
                { userId, date: { $gte: startOfDay, $lte: endOfDay } },
                {
                    $set:
                        activity === "checkIn"
                            ? { checkIn: time, reason: { reason, time: `${hour}:${minute}` } }
                            : { checkOut: time },
                },
                { new: true }
            );

            if (!attendence)
                throw new BadRequestError(
                    `${activity === "checkIn" ? "CheckIn" : "CheckOut"
                    } failed due to some issue !`
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
     * Retrieves the attendance record for a student based on the user ID and optional batch IDs.
     * @param {string} userId - The ID of the user to search for attendence records
     * @param {string[]} batchIds - The IDs of the batches to search for attendence records
     * @returns {Promise<IAttendenceSchema>} - The attendance record if found, null otherwise
     * @throws - Passes any errors to the caller
     */
    async getAttendence(userId: string): Promise<IAttendenceSchema> {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59

            // Find attendence of today's with time range
            const attendance = await this.attendenceRepository.findOne({
                userId,
                date: { $gte: startOfDay, $lte: endOfDay },
            });

            if (!attendance) throw new NotFoundError("No attendence found !");

            return attendance;
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
    async searchAttendence(
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

    /**
     * Uploads a snapshot of a student.
     * @param {string} userId - The ID of the user to upload snapshot.
     * @param {string} imageUrl - The URL of the image to upload.
     * @returns {Promise<void>} - A promise that resolves when the snapshot is successfully uploaded and sent, or passes an error to the next middleware.
     * @throws {BadRequestError} - If update fails.
     * @throws {NotFoundError} - If attendence not found.
     */
    async uploadSnapshot(
        userId: string,
        imageUrl: string,
        location: string
    ): Promise<void> {
        try {
            // get current hour and minute
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const allowedHours = [11, 13, 16];

            const isAllowedTime =
                allowedHours.includes(currentHour) && currentMinute <= 10;

            if (!isAllowedTime) {
                throw new Error("You are late to submit the snapshot !");
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59

            // Find attendence of today's with time range
            const attendance = await this.attendenceRepository.findOne({
                userId,
                date: { $gte: startOfDay, $lte: endOfDay },
            });

            if (!attendance) throw new NotFoundError("Attendence not found !");

            // Name of the snapshot
            type nameType = "Tea" | "Lunch" | "Evening";
            let name: nameType | null = null;

            if (currentHour === 11) {
                name = "Tea";
            } else if (currentHour === 13) {
                name = "Lunch";
            } else if (currentHour === 16) {
                name = "Evening";
            }

            if (!name) {
                throw new Error("Failed to submit snapshot !");
            }

            // Now check if snapshot is already uploaded
            const alreadyExists = attendance?.selfies?.some(
                (selfie: any) => selfie.name === name
            );

            if (alreadyExists) {
                throw new Error(`${name} break snapshot already submitted !`);
            }

            // New snapshot
            const newSelfie = {
                name: name,
                time: new Date().toLocaleTimeString(),
                photo: imageUrl,
                location,
                isVerified: false,
            };

            // Selfie index map
            const selfieIndexMap = {
                Tea: 0,
                Lunch: 1,
                Evening: 2,
            };

            const selfies: (ISelfie | null)[] = [
                attendance.selfies?.[0],
                attendance.selfies?.[1],
                attendance.selfies?.[2],
            ];
            selfies[selfieIndexMap[name]] = newSelfie;

            // Update attendence
            const updatedAttendance = await this.attendenceRepository.update(
                { userId, date: { $gte: startOfDay, $lte: endOfDay } },
                {
                    $set: {
                        selfies,
                    },
                },
                { new: true }
            );

            if (!updatedAttendance)
                throw new NotFoundError("Failed to upload snapshot !");
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the status of an attendance record
     * @param {string} attendenceId - The ID of the attendance record to update
     * @param {string} status - The status to update the attendance record to
     * @throws {NotFoundError} - If the attendance record is not found
     * @throws - Passes any other errors to the caller
     */
    async updateStatus(
        attendenceId: string,
        status: "Pending" | "Present" | "Absent"
    ): Promise<void> {
        try {
            // Find attendence of today's with time range
            const attendance = await this.attendenceRepository.findOne({
                _id: attendenceId,
            });

            if (!attendance) throw new NotFoundError("Attendence not found !");

            const updatedAttendance = await this.attendenceRepository.update(
                { _id: attendenceId },
                {
                    $set: {
                        status,
                    },
                },
                {
                    new: true,
                }
            );

            // console.log(updatedAttendance);
        } catch (err: unknown) {
            throw err;
        }
    }
}
