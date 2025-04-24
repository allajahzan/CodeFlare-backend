import cron from "node-cron";
import { getStudentsIds } from "../grpc/client/userClient";
import { AttendenceRepository } from "../repository/implementation/attendenceRepository";
import Attendence from "../model/attendence";
import { ObjectId } from "mongoose";
import { SnapshotProducer } from "../events/producer/snapshotProducer";

const attendenceRepository = new AttendenceRepository(Attendence);

// Check weather today is sunday or not
const isSunday = () => new Date().getDay() === 0;

// Prepare attendence for all students of all batches on 7AM everyday
cron.schedule(
    "0 7 * * *",
    async () => {
        try {
            // Check weather today is sunday or not
            if (isSunday()) return;

            // Get all students ids
            const resp = await getStudentsIds();

            if (resp && resp.response?.status === 200) {
                const students = resp.response?.students || [];

                // console.log(students);

                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00

                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59

                // Fetch all attendance lists of today's
                const todayAttendances = await attendenceRepository.find({
                    date: { $gte: startOfDay, $lte: endOfDay },
                });

                // console.log(todayAttendances);

                // Set of userIds who already have attendance
                const existingUserIds = new Set(
                    todayAttendances.map((attendence) => attendence.userId.toString())
                );

                // console.log(existingUserIds);

                // Filter students who already have attendance for today
                const newAttendances = students
                    .filter(
                        (student: any) => !existingUserIds.has(student._id.toString())
                    )
                    .map((student: any) => ({
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
                    }));

                // console.log(newAttendances);

                // If new attendences are there
                if (newAttendances.length > 0) {
                    await attendenceRepository.insertMany(newAttendances);
                }
            }
        } catch (err: unknown) {
            console.log(err);
        }
    },
);

// Mark attendence for all students of all batches on 10 PM everyday
cron.schedule(
    "0 22 * * *",
    async () => {
        try {
            // Check weather today is sunday or not
            if (isSunday()) return;

            // (optional)...
            // Checkout students who checkedIn but didn't checkOut
            // await attendenceRepository.updateMany(
            //     { checkIn: { $ne: null }, status: "Pending", checkOut: null },
            //     { $set: { checkOut: "22:00" } }
            // );

            // Mark present for students who checked in & out, and status is pending
            await attendenceRepository.updateMany(
                { checkIn: { $ne: null }, checkOut: { $ne: null }, status: "Pending" },
                { $set: { status: "Present" } }
            );

            // Mark absent for student who didn't check in
            await attendenceRepository.updateMany(
                { $or: [{ checkIn: null }, { checkOut: null }] },
                { $set: { status: "Absent" } }
            );
        } catch (err: unknown) {
            console.log(err);
        }
    },
);

// Send snapshot notification for all students of all batches on 11 AM everyday
cron.schedule(
    "0 11 * * *",
    async () => {
        try {
            // Check weather today is sunday or not
            if (isSunday()) return;

            // Send snapshot event
            const snapshotProducer = new SnapshotProducer(
                new Date().toLocaleTimeString(),
                "Send snapshot for tea break within 10 minutes."
            );
            snapshotProducer.publish();
        } catch (err: unknown) {
            console.log(err);
        }
    },
);

// Send snapshot notification for all students of all batches on 1 PM everyday
cron.schedule(
    "0 13 * * *",
    async () => {
        try {
            // Check weather today is sunday or not
            if (isSunday()) return;

            // Send snapshot event
            const snapshotProducer = new SnapshotProducer(
                new Date().toLocaleTimeString(),
                "Send snapshot for lunch break within 10 minutes."
            );
            snapshotProducer.publish();
        } catch (err: unknown) {
            console.log(err);
        }
    },
);

// Send snapshot notification for all students of all batches on 4 AM everyday
cron.schedule(
    "0 16 * * *",
    async () => {
        try {
            // Check weather today is sunday or not
            if (isSunday()) return;

            // Send snapshot event
            const snapshotProducer = new SnapshotProducer(
                new Date().toLocaleTimeString(),
                "Send snapshot for evening break within 10 minutes."
            );
            snapshotProducer.publish();
        } catch (err: unknown) {
            console.log(err);
        }
    },
);
