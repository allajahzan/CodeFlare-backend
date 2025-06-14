import {
    BadRequestError,
    ExpiredError,
    IBatch,
    IStudent,
    IUser,
    IUserBasic,
    JwtPayloadType,
    NotFoundError,
} from "@codeflare/common";
import { IAttendenceDto, ICheckInOutDto } from "../../dto/attendenceDto";
import { IAttendenceRepository } from "../../repository/interface/IAttendenceRepository";
import { IAttendenceService } from "../interface/IAttendenceService";
import { ObjectId } from "mongoose";
import { getUser, getUsers } from "../../grpc/client/userClient";
import { getCachedBatch } from "../../utils/cachedBatches";
import { WarningProducer } from "../../events/producer/warningProducer";
import { ISnapshotRepository } from "../../repository/interface/ISnapshotRepository";
import { ISelfie } from "../../entities/ISnapshot";

/** Implementation of Attendence Service */
export class AttendenceService implements IAttendenceService {
    private attendenceRepository: IAttendenceRepository;
    private snapshotRepository: ISnapshotRepository;

    /**
     * Constructor for Attendence Service
     * @param {IAttendenceRepository} attendenceRepository - Instance of Attendence Repository
     * @param {ISnapshotRepository} snapshotRepository - Instance of Snapshot Repository
     */
    constructor(
        attendenceRepository: IAttendenceRepository,
        snapshotRepository: ISnapshotRepository
    ) {
        this.attendenceRepository = attendenceRepository;
        this.snapshotRepository = snapshotRepository;
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

            // Check weather today is sunday or not (for students)
            const today = new Date();
            if (today.getDay() === 0) {
                throw new BadRequestError("You don't have to check-in on sundays!");
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
                    } failed due to some issue!`
                );
            }

            // If already checked-in or checked-out
            if (
                (activity === "checkIn" && isAttendenceExist.checkIn) ||
                (activity === "checkOut" && isAttendenceExist.checkOut)
            ) {
                throw new BadRequestError(
                    `You have already ${activity === "checkIn" ? "checked-in" : "checked-out"
                    }!`
                );
            }

            // Check if Check-in is late or very late (Before approval-default)
            if (!isAttendenceExist.isApproved)
                if (activity === "checkIn" && !reason) {
                    if ((hour === 9 && minute >= 0) || (hour === 10 && minute === 0)) {
                        throw new ExpiredError(
                            "You are late to check-in. Please submit the reason!"
                        );
                    } else if (hour > 10 || (hour === 10 && minute > 0)) {
                        throw new BadRequestError(
                            "You are very late. Please contact your coordinator!"
                        );
                    }
                }

            // Ask for reason (After approval)
            if (isAttendenceExist.isApproved)
                if (activity === "checkIn" && !reason) {
                    throw new ExpiredError(
                        "You are late to check-in. Please submit the reason!"
                    );
                }

            // Check weather student crossed more than 8 hours
            if (activity === "checkOut") {
                if (!isAttendenceExist.checkIn) {
                    throw new BadRequestError("You didn't even check-in to check-out!");
                }

                const [checkedInHour, checkedInMinute] = isAttendenceExist.checkIn
                    .split(":")
                    .map(Number);

                const checkedInDate = new Date(isAttendenceExist.date);
                checkedInDate.setHours(checkedInHour, checkedInMinute, 0, 0);

                const now = new Date();
                const diffInMs = now.getTime() - checkedInDate.getTime();
                const diffInMinutes = diffInMs / (1000 * 60);

                if (diffInMinutes < 8 * 60) {
                    throw new BadRequestError(
                        "You have to complete 8 hours to check-out!"
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
                updateFields.status = "Present";
            }

            // Update attendance
            updatedAttendance = await this.attendenceRepository.update(
                { userId, date: { $gte: startOfDay, $lte: endOfDay } },
                { $set: updateFields },
                { new: true }
            );

            if (!updatedAttendance)
                throw new BadRequestError(
                    `${activity === "checkIn" ? "Check-in" : "Check-out"
                    } failed due to some issue!`
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
     * @returns {Promise<IAttendenceDto | IAttendenceDto[]>} - The attendance lists if found, error otherwise
     * @throws {NotFoundError} - If no attendance lists are found
     */
    async getAttendence(
        userId: string,
        month?: string,
        year?: string
    ): Promise<IAttendenceDto | IAttendenceDto[]> {
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

                if (!attendance) throw new NotFoundError("No attendence found!");

                // Map data to return type
                const attendenceDto: IAttendenceDto = {
                    _id: attendance._id as unknown as string,
                    userId: attendance.userId as unknown as string,
                    batchId: attendance.batchId as unknown as string,
                    date: attendance.date,
                    checkIn: attendance.checkIn,
                    checkOut: attendance.checkOut,
                    isApproved: attendance.isApproved,
                    status: attendance.status,
                    reason: {
                        description: attendance.reason?.description || "",
                        time: attendance.reason?.time || "",
                    },
                    report: {
                        description: attendance.report?.description || "",
                        time: attendance.report?.time || "",
                    },
                    selfies: attendance.selfies,
                };

                return attendenceDto;
            }
            // If month and year are there
            // To get attendence of that month of that year of a student
            else {
                const attendances = await this.attendenceRepository.find({
                    userId,
                    date: {
                        $gte: new Date(`${year}-${month}-01`),
                        $lte: new Date(`${year}-${month}-31`),
                    },
                });

                if (!attendances || attendances.length === 0)
                    throw new NotFoundError("No attendence recorded this month!");

                // Map data to return type
                const attendenceDtos: IAttendenceDto[] = attendances.map(
                    (attendance) => {
                        return {
                            _id: attendance._id as unknown as string,
                            userId: attendance.userId as unknown as string,
                            batchId: attendance.batchId as unknown as string,
                            date: attendance.date,
                            checkIn: attendance.checkIn,
                            checkOut: attendance.checkOut,
                            isApproved: attendance.isApproved,
                            status: attendance.status,
                            reason: {
                                description: attendance.reason?.description || "",
                                time: attendance.reason?.time || "",
                            },
                            report: {
                                description: attendance.report?.description || "",
                                time: attendance.report?.time || "",
                            },
                            selfies: attendance.selfies,
                        };
                    }
                );

                return attendenceDtos;
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
    ): Promise<IAttendenceDto[] | []> {
        try {
            const attendences = await this.attendenceRepository.searchAttendence(
                userId,
                batchIds,
                date,
                sort,
                order,
                filter
            );

            if (!attendences || attendences.length === 0) return [];

            const userIds = []; // UserIds

            for (let i = 0; i < attendences.length; i++) {
                userIds.push(...[attendences[i].userId as unknown as string]);
            }

            // Users info through gRPC
            let usersMap: Record<string, IUser | IStudent>;

            const resp = await getUsers([...new Set(userIds)], "");

            // Success response from gRPC
            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            } else {
                throw new BadRequestError(resp.response.message);
            }

            // Create a map to hold snapshots
            const snapshots = new Map<string, ISelfie[]>();

            for (let i = 0; i < attendences.length; i++) {
                const attendenceId = attendences[i]._id as unknown as string;
                const selfies = await this.snapshotRepository.find({
                    attendenceId: attendences[i]._id,
                });
                snapshots.set(attendenceId, selfies);
            }

            // Map data to return type
            // Get user details thorugh gRPC and batch details from cache
            const attendencesWithUserAndBatch: IAttendenceDto[] = await Promise.all(
                attendences.map(async (attendence) => {
                    return {
                        _id: attendence._id as unknown as string,
                        userId: attendence.userId as unknown as string,
                        user: usersMap[attendence.userId as unknown as string],
                        batchId: attendence.batchId as unknown as string,
                        batch: (await getCachedBatch(
                            attendence.batchId as unknown as string
                        )) as IBatch,
                        date: attendence.date,
                        checkIn: attendence.checkIn,
                        checkOut: attendence.checkOut,
                        isApproved: attendence.isApproved,
                        status: attendence.status,
                        reason: {
                            description: attendence.reason?.description || "",
                            time: attendence.reason?.time || "",
                        },
                        report: {
                            description: attendence.report?.description || "",
                            time: attendence.report?.time || "",
                        },
                        selfies: attendence.selfies,
                        snapshots: snapshots.get(attendence._id as unknown as string),
                    };
                })
            );

            return attendencesWithUserAndBatch;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Approves a check-in request by updating the attendance status to "Approved"
     * @param {string} tokenPayload - The payload of the JSON Web Token containing the coordinator ID.
     * @param {string} attendanceId - The ID of the attendance to be approved.
     * @returns {Promise<void>} - A promise that resolves when the attendance is successfully approved and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async approvalCheckIn(
        tokenPayload: string,
        attendanceId: string
    ): Promise<void> {
        try {
            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Coordinator id
            const coordinatorId = _id;
            let coordinator: IUser;

            // Get coordinator info through gRPC
            const resp = await getUser(coordinatorId);

            if (resp.response && resp.response.status === 200) {
                coordinator = resp.response.user as IUser;
            } else {
                throw new BadRequestError(resp.response.message);
            }

            const attendance = await this.attendenceRepository.findOne({
                _id: attendanceId,
            });

            if (!attendance) throw new NotFoundError("No attendence found!");

            const updatedAttendance = await this.attendenceRepository.update(
                { _id: attendanceId },
                { $set: { isApproved: true } }
            );

            if (!updatedAttendance)
                throw new BadRequestError("Failed approval for check-in!");

            // Send notification to student
            const warningProducer = new WarningProducer(
                coordinatorId,
                coordinator as IUserBasic,
                attendance.userId as unknown as string,
                "Your check-in has been approved!"
            );

            await warningProducer.publish();
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
                throw new Error("You are late to submit the snapshot!");
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

            if (!attendance) throw new NotFoundError("Attendence not found!");

            // Name of the snapshot
            type nameType = "Morning" | "Lunch" | "Evening";
            let name: nameType | null = null;

            // Selfie index map
            const selfieIndexMap = {
                Morning: 0,
                Lunch: 1,
                Evening: 2,
            };

            if (currentHour === 11) {
                name = "Morning";
            } else if (currentHour === 13) {
                name = "Lunch";
            } else if (currentHour === 16) {
                name = "Evening";
            }

            if (!name) {
                throw new Error("Failed to submit snapshot!");
            }

            // Check if snapshot is already submitted
            attendance.selfies.forEach((selfie, index) => {
                if (selfieIndexMap[name] === index && selfie) {
                    throw new Error(`${name}-break snapshot already submitted!`);
                }
            });

            // New snapshot
            const hour = new Date().getHours();
            const minute = new Date().getMinutes();

            const newSnapshot = {
                attendenceId: attendance._id as ObjectId,
                userId: userId as unknown as ObjectId,
                name: name,
                photo: imageUrl,
                time: `${hour}:${minute}`,
                location,
            };

            // Upload snapshot
            const snapshot = await this.snapshotRepository.create(newSnapshot);
            if (!snapshot) throw new BadRequestError("Failed to upload snapshot!");

            const selfies: boolean[] = [false, false, false];
            selfies[selfieIndexMap[name]] = true;

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
                throw new NotFoundError("Failed to upload snapshot!");
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the status of an attendance record.
     * @param {string} attendenceId - The ID of the attendance record to update.
     * @param {"Pending" | "Present" | "Absent" | "Late"} status - The new status to set for the attendance record.
     * @param {string} report - The report description to associate with the attendance status update.
     * @returns {Promise<void>} - A promise that resolves when the attendance status has been successfully updated, or throws an error if the update fails.
     * @throws {Error} - If the status is invalid.
     * @throws {NotFoundError} - If the attendance record is not found.
     * @throws {BadRequestError} - If the student hasn't checked in yet but the status is set to "Present" or "Late".
     */
    async updateStatus(
        attendenceId: string,
        status: "Pending" | "Present" | "Absent" | "Late",
        report: string
    ): Promise<void> {
        try {
            // Check status type
            if (!["Pending", "Present", "Absent", "Late"].includes(status)) {
                throw new Error("Failed to update status!");
            }

            // Find attendence with attendence ID
            const attendance = await this.attendenceRepository.findOne({
                _id: attendenceId,
            });

            if (!attendance) throw new NotFoundError("Attendence not found!");

            // Check if student is checked-in or not if status is Late
            if ((status === "Present" || status === "Late") && !attendance.checkIn) {
                throw new BadRequestError("Student didn't check-in yet!");
            }

            // Current time
            const currentTime = new Date();
            const hour = currentTime.getHours();
            const minute = currentTime.getMinutes();

            const updatedAttendance = await this.attendenceRepository.update(
                { _id: attendenceId },
                {
                    $set: {
                        status,
                        report: { description: report, time: `${hour}:${minute}` },
                        reason: { description: "", time: "" },
                    },
                },
                { new: true }
            );

            if (!updatedAttendance)
                throw new BadRequestError("Failed to update status!");
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
        filter: string,
        skip: number,
        limit: number
    ): Promise<IAttendenceDto[]> {
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
                    filter,
                    skip,
                    limit
                );
            }
            // Attendence defaulters who is late or absent more thatn 2 days
            else if (type === "monthly-defaulters") {
                attendences = await this.attendenceRepository.getDefaulters(
                    userId,
                    batchIds,
                    monthMap[month],
                    year,
                    filter,
                    skip,
                    limit
                );
            }

            if (!attendences || !attendences.length) return [];

            const userIds = []; // UserIds

            for (let i = 0; i < attendences.length; i++) {
                userIds.push(...[attendences[i].userId as unknown as string]);
            }

            // Users info through gRPC
            let usersMap: Record<string, IUser | IStudent>;

            const resp = await getUsers([...new Set(userIds)], "");

            // Success response from gRPC
            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            } else {
                throw new BadRequestError(resp.response.message);
            }

            // Fetch batch details and user detils
            const attendencesWithUserAndBatchDetails: IAttendenceDto[] =
                await Promise.all(
                    attendences.map(async (attendence) => {
                        const user = usersMap[attendence.userId.toString()] as
                            | IUser
                            | IStudent;
                        const batch = (await getCachedBatch(attendence.batchId)) as IBatch;

                        return {
                            _id: String(attendence._id),
                            userId: String(attendence.userId),
                            user,
                            batchId: String(attendence.batchId),
                            batch,
                            date: attendence.date,
                            checkIn: attendence.checkIn,
                            checkOut: attendence.checkOut,
                            isApproved: attendence.isApproved,
                            status: attendence.status,
                            reason: {
                                description: attendence.reason?.description || "",
                                time: attendence.reason?.time || "",
                            },
                            report: {
                                description: attendence.report?.description || "",
                                time: attendence.report?.time || "",
                            },
                            selfies: attendence.selfies,
                        };
                    })
                );

            return attendencesWithUserAndBatchDetails;
        } catch (err: unknown) {
            throw err;
        }
    }
}
