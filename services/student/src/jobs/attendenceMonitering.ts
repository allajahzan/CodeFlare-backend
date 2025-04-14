import cron from "node-cron";
import { getStudentsIds } from "../grpc/client/userClient";
import { AttendenceRepository } from "../repository/implementation/attendenceRepository";
import Attendence from "../model/attendence";
import { IAttendenceSchema } from "../entities/IAttendence";
import { ObjectId } from "mongoose";
import { SnapshotProducer } from "../events/producer/snapshotProducer";

const attendenceRepository = new AttendenceRepository(Attendence);

// Prepare attendence for all students of all batches on 7AM everyday
cron.schedule(
    "* 7 * * *",
    async () => {
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
        } catch (err: unknown) {
            console.log(err);
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Mark attendence for all students of all batches on 10 PM everyday
cron.schedule(
    "* 22 * * *",
    async () => {
        try {
            // Checkout students who checkedIn but didn't checkOut
            await attendenceRepository.updateMany(
                { checkIn: { $ne: null }, status: "Pending", checkOut: null },
                { $set: { checkOut: "22:00" } }
            );

            // Mark present for students who check in and status is pending
            await attendenceRepository.updateMany(
                { checkIn: { $ne: null }, status: "Pending" },
                { $set: { status: "Present" } }
            );

            // Mark absent for student who didn't check in
            await attendenceRepository.updateMany(
                { checkIn: null },
                { $set: { status: "Absent" } }
            );
        } catch (err: unknown) {
            console.log(err);
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Send snapshot notification for all students of all batches on 11 AM everyday
cron.schedule(
    "* 11 * * *",
    async () => {
        try {
            // Send snapshot event
            const snapshotProducer = new SnapshotProducer(
                new Date().toLocaleTimeString(),
                "Send snapshot for tea break within 5 minutes."
            );
            snapshotProducer.publish();
        } catch (err: unknown) {
            console.log(err);
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Send snapshot notification for all students of all batches on 1 PM everyday
cron.schedule(
    "* 13 * * *",
    async () => {
        try {
            // Send snapshot event
            const snapshotProducer = new SnapshotProducer(
                new Date().toLocaleTimeString(),
                "Send snapshot for lunch break within 5 minutes."
            );
            snapshotProducer.publish();
        } catch (err: unknown) {
            console.log(err);
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Send snapshot notification for all students of all batches on 4 AM everyday
cron.schedule(
    "* 16 * * *",
    async () => {
        try {
            // Send snapshot event
            const snapshotProducer = new SnapshotProducer(
                new Date().toLocaleTimeString(),
                "Send snapshot for evening break within 5 minutes."
            );
            snapshotProducer.publish();
        } catch (err: unknown) {
            console.log(err);
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);
