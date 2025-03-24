import cron from "node-cron";
import { getStudentsIds } from "../grpc/client/userClient";
import { AttendenceRepository } from "../repository/implementation/attendenceRepository";
import Attendence from "../model/attendence";
import { IAttendenceSchema } from "../entities/IAttendence";
import { ObjectId } from "mongoose";

const attendenceRepository = new AttendenceRepository(Attendence);

// Prepate attendence for all students of all batches on 7AM everyday
cron.schedule("7 6 * * *", async () => {
    try {
        const resp = await getStudentsIds();

        if (resp && resp.response?.status === 200) {
            const students = resp.response?.students || [];

            // Map into parameter type
            const data = students.map((student: any) => ({
                userId: student._id as ObjectId,
                batchId: student.batch as ObjectId,
                checkIn: null,
                checkOut: null,
                reason: {},
                status: "Pending",
                selfies: [],
                date: new Date(),
                isApproved: false,
                isPartial: false,
            })) as Partial<Record<keyof IAttendenceSchema, any>>[];

            await attendenceRepository.insertMany(data);
        }
    } catch (err) {
        console.log(err);
    }
});
