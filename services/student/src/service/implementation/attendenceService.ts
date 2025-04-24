import { BadRequestError, NotFoundError } from "@codeflare/common";
import { ICheckInOutDto } from "../../dto/attendenceService";
import { IAttendenceRepository } from "../../repository/interface/IAttendenceRepository";
import { IAttendenceService } from "../interface/IAttendenceService";
import { ObjectId, UpdateQuery } from "mongoose";
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
     * Handles the check-in or check-out process for a student.
     * @param {string} userId - Unique identifier of the user.
     * @param {string} activity - Type of activity ('checkIn' or 'checkOut').
     * @param {string} [reason] - Reason for late check-in. Not required for normal check-in.
     * @param {string} [attendanceId] - Unique identifier of the attendance to update. Optional.
     * @returns {Promise<ICheckInOutDto>} - A promise that resolves when the operation is complete.
     * @throws {BadRequestError} - If the check-in or check-out request is invalid.
     * @throws {NotFoundError} - If the attendance record is not found.
     */
    async checkInOut(
        userId: string,
        activity: string,
        reason: string,
        attendanceId?: string
    ): Promise<ICheckInOutDto> {
        try {
            // Updated attendence
            let updatedAttendance;

            // Current time
            const currentTime = new Date();
            const hour = currentTime.getHours();
            const minute = currentTime.getMinutes();

            // When students check-in or check-out, there won't be any attendence ID
            if (!attendanceId) {
                // Check weather today is sunday or not (for students)
                const today = new Date();
                if (today.getDay() === 0) {
                    throw new BadRequestError(
                        "You don't have to check-in or check-out on Sundays !"
                    );
                }

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

                // If already checked-in or checked-out
                if (
                    (activity === "checkIn" && isAttendenceExist.checkIn) ||
                    (activity === "checkOut" && isAttendenceExist.checkOut)
                ) {
                    throw new BadRequestError(
                        `You have already ${activity === "checkIn" ? "checked-in " : "checked-out "
                        }!`
                    );
                }

                // Check if Check-in is late or very late
                if (activity === "checkIn" && !reason) {
                    if ((hour === 9 && minute >= 0) || (hour === 10 && minute === 0)) {
                        throw new Error(
                            "You are late to check-in. Please submit the reason !"
                        );
                    } else if (hour > 10 || (hour === 10 && minute > 0)) {
                        throw new BadRequestError(
                            "You are very late. Please contact your coordinator !"
                        );
                    }
                }

                // Check weather student crossed more than 8 hours
                if (activity === "checkOut") {
                    if (!isAttendenceExist.checkIn) {
                        throw new BadRequestError(
                            "You didn't even check-in to check-out !"
                        );
                    }

                    const currentHour = new Date().getHours();
                    const checkedInHour = Number(isAttendenceExist.checkIn.split(":")[0]);
                    if (currentHour - checkedInHour < 8) {
                        throw new BadRequestError(
                            "You are not permitted to check-out right now !"
                        );
                    }
                }

                // Prepare update fields
                let updateFields: any = {};

                if (activity === "checkIn") {
                    updateFields.checkIn = `${hour}:${minute}`;

                    if (reason) {
                        updateFields.reason = {
                            description: reason,
                            time: `${hour}:${minute}`,
                        };
                        updateFields.status = "Late";
                    }
                } else if (activity === "checkOut") {
                    updateFields.checkOut = `${hour}:${minute}`;
                }

                // Update attendance
                updatedAttendance = await this.attendenceRepository.update(
                    { userId, date: { $gte: startOfDay, $lte: endOfDay } },
                    { $set: updateFields },
                    { new: true }
                );
            }
            // When coordinator check-in or check-out for students, attendence ID will be there
            else {
                updatedAttendance = await this.attendenceRepository.update(
                    { _id: attendanceId },
                    {
                        $set:
                            activity === "checkIn"
                                ? { checkIn: `${hour}:${minute}` }
                                : { checkOut: `${hour}:${minute}` },
                    },
                    { new: true }
                );
            }

            if (!updatedAttendance)
                throw new BadRequestError(
                    `${activity === "checkIn" ? "Check-in" : "Check-out"
                    } failed due to some issue !`
                );

            // Map data to return type
            const checkInOut: ICheckInOutDto = {
                userId,
                date: updatedAttendance.date,
                ...(activity === "checkIn"
                    ? { checkIn: updatedAttendance.checkIn }
                    : { checkOut: updatedAttendance.checkOut }),
                status: updatedAttendance.status,
            };

            return checkInOut;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Retrieves attendance lists for a student based on user ID and optional month and year.
     * @param {string} userId - The ID of the user to retrieve attendance lists for
     * @param {string} [month] - The month to retrieve attendance lists for (Format: MM)
     * @param {string} [year] - The year to retrieve attendance lists for (Format: YYYY)
     * @returns {Promise<IAttendenceSchema | IAttendenceSchema[]>} - The attendance lists if found, error otherwise
     * @throws {NotFoundError} - If no attendance lists are found
     */
    async getAttendence(
        userId: string,
        month?: string,
        year?: string
    ): Promise<IAttendenceSchema | IAttendenceSchema[]> {
        try {
            // If month and year are not there
            // To get single attendence of a student
            if (!month && !year) {
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
            }
            // If month and year are there
            // To get attendence of that month of that year of a student
            else {
                const attendence = await this.attendenceRepository.find({
                    userId,
                    date: {
                        $gte: new Date(`${year}-${month}-01`),
                        $lte: new Date(`${year}-${month}-31`),
                    },
                });

                if (!attendence || attendence.length === 0)
                    throw new NotFoundError("No attendence recorded this month !");

                return attendence;
            }
        } catch (err: unknown) {
            throw err;
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
     * @returns {Promise<IAttendenceSchema[] | []>} - A promise that resolves to an array of attendance lists if found, an empty array otherwise.
     * @throws - Returns errors if any occurs during the process.
     */
    async searchAttendence(
        userId: string,
        batchIds: string[],
        date: string,
        sort: string,
        order: number,
        filter: string
    ): Promise<IAttendenceSchema[] | []> {
        try {
            const attendences = await this.attendenceRepository.searchAttendence(
                userId,
                batchIds,
                date,
                sort,
                order,
                filter
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
     * @param {string} userId - The ID of the user to upload snapshot for
     * @param {string} imageUrl - The URL of the image of the snapshot
     * @param {string} location - The location of the snapshot
     * @returns {Promise<void>} - A promise that resolves when the snapshot is successfully uploaded and sent, or passes an error to the next middleware.
     * @throws {NotFoundError} - If no attendance is found
     * @throws {BadRequestError} - If not allowed time
     * @throws - Passes any errors to the next middleware.
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
                (selfie: any) => selfie && selfie.name === name
            );

            if (alreadyExists) {
                throw new Error(`${name}-break snapshot already submitted !`);
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
     * Updates the status of an attendance record based on the attendance ID and status.
     * @param {string} attendenceId - The ID of the attendance record to update.
     * @param {"Pending" | "Present" | "Absent" | "Late"} status - The new status of the attendance record.
     * @param {string} [reason] - The reason for status update, only required when status is "Absent".
     * @returns {Promise<void>} - A promise that resolves when the attendance record is successfully updated and sent, or passes an error to the next middleware.
     * @throws {BadRequestError} - If update fails.
     * @throws {NotFoundError} - If attendence not found.
     */
    async updateStatus(
        attendenceId: string,
        status: "Pending" | "Present" | "Absent" | "Late",
        reason?: string
    ): Promise<void> {
        try {
            // Update query
            let updateQuery: UpdateQuery<IAttendenceSchema>;

            // Update status by coordinator
            if (status) {
                // Check status type
                if (!["Pending", "Present", "Absent", "Late"].includes(status)) {
                    throw new Error("Failed to update status !");
                }

                // Find attendence with attendence ID
                const attendance = await this.attendenceRepository.findOne({
                    _id: attendenceId,
                });

                if (!attendance) throw new NotFoundError("Attendence not found !");

                // Check if student is checked-in or not if status is Late
                if (
                    (status === "Present" || status === "Late") &&
                    !attendance.checkIn
                ) {
                    throw new BadRequestError("Student didn't check-in yet !");
                }

                // Prepare update data
                const updateData: any = {
                    status,
                };

                if (reason) {
                    updateQuery = {
                        $set: {
                            ...updateData,
                            "reason.description": reason,
                            "reason.time":
                                new Date().getHours() + ":" + new Date().getMinutes(),
                        },
                    };
                } else {
                    updateQuery = {
                        $set: updateData,
                        $unset: {
                            "reason.description": "",
                            "reason.time": "",
                        },
                    };
                }
            } else {
                // When only reason is there, and no status (update reason by coordinator)
                updateQuery = {
                    $set: {
                        "reason.description": reason,
                    },
                };
            }

            const updatedAttendance = await this.attendenceRepository.update(
                { _id: attendenceId },
                updateQuery,
                { new: true }
            );

            if (!updatedAttendance)
                throw new BadRequestError("Failed to update status !");
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Retrieves attendance records based on type, user ID, batch IDs, month, year, and additional filters.
     * @param {string} type - The type of attendance records to retrieve, either "monthly-overview" or "tagged-students".
     * @param {string} userId - The ID of the user to retrieve attendance records for.
     * @param {string[]} batchIds - A list of batch IDs to filter attendance records.
     * @param {string} month - The month to retrieve attendance records for (Format: January, February, etc.).
     * @param {number} year - The year to retrieve attendance records for (Format: YYYY).
     * @param {string} filter - Additional filter criteria for attendance status.
     * @returns {Promise<IAttendenceSchema[]>} - A promise that resolves to an array of attendance records if found, an empty array otherwise.
     * @throws {BadRequestError} - If user ID or batch IDs are not found.
     * @throws {NotFoundError} - If attendance records are not found.
     */
    async getMonthlyAttendence(
        type: string,
        userId: string,
        batchIds: string[],
        month: string,
        year: number,
        filter: string
    ): Promise<IAttendenceSchema[]> {
        try {
            // Month map
            const monthMap: Record<string, number> = {
                January: 1,
                February: 2,
                March: 3,
                April: 4,
                May: 5,
                June: 6,
                July: 7,
                August: 8,
                September: 9,
                October: 10,
                November: 11,
                December: 12,
            };

            // Get attendences
            let attendences;

            // Monthly overview of all students
            if (type === "monthly-overview") {
                attendences = await this.attendenceRepository.getMonthlyOverview(
                    userId,
                    batchIds,
                    monthMap[month],
                    year,
                    filter
                );
            }
            // Flagged students who is late or absent more thatn 2 days
            else if (type === "flagged-students") {
                console.log("hey")
                attendences = await this.attendenceRepository.getFlaggedStudents(
                    userId,
                    batchIds,
                    monthMap[month],
                    year,
                    filter
                );
            }

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
