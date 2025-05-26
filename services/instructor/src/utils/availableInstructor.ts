import { ObjectId, Schema } from "mongoose";
import { getUsers } from "../grpc/client/userClient";
import { IReviewRepository } from "../repository/interface/IReviewRepository";
import { IStudent, IUser } from "@codeflare/common";

/**
 * Retrieves an available instructor for a given domainId.
 *
 * Retrieves all instructors and their 'Pending' reviews count for a given domainId.
 * Then, it chooses an instructor with the minimum count of 'Pending' reviews.
 * If more than one instructor has the same minimum count, a random one is chosen.
 *
 * @param reviewRepository - Review repository
 * @param domainId - Domain Id
 * @returns An available instructor's id
 */
export const getAvailableInstructor = async (
    reviewRepository: IReviewRepository,
    domainId: string
): Promise<string> => {
    try {
        // Get all instructors through gRPC
        const respPromise = getUsers([], "instructor");

        // Reviews with status 'Pending'
        const reviewsPromise = reviewRepository.find({
            status: "Pending",
            domainId,
        });

        const [resp, reviews] = await Promise.all([respPromise, reviewsPromise]);

        // Success response
        let usersMap: Record<string, IUser | IStudent> = {};
        if (resp && resp.response.status === 200) {
            usersMap = resp.response.users;
        } else {
            throw new Error("Failed to schedule review!");
        }

        // Instructors 'Pending' reviews count;
        const instructorsReviewsCount: Record<string, number> = {};

        // Set count 0 for all instructors with domainId, initailly
        for (let i = 0; i < Object.keys(usersMap).length; i++) {
            if (usersMap[Object.keys(usersMap)[i]]?.domain === domainId.toString()) {
                instructorsReviewsCount[Object.keys(usersMap)[i]] = 0;
            }
        }

        // Set 'Pending' reviews count for instructors with domainId
        for (let i = 0; i < reviews.length; i++) {
            if (
                instructorsReviewsCount[reviews[i].instructorId.toString()] !== null
            ) {
                instructorsReviewsCount[reviews[i].instructorId.toString()] += 1;
            }
        }

        // Get the mincount
        const minCount = Math.min(...Object.values(instructorsReviewsCount));

        // Get instructors with minCount
        const minCountInstructors = Object.keys(instructorsReviewsCount).filter(
            (instructorId) => instructorsReviewsCount[instructorId] === minCount
        );

        // Get random instructor
        const randomInstructorId =
            minCountInstructors[
            Math.floor(Math.random() * minCountInstructors.length)
            ];

        return randomInstructorId;
    } catch (err: unknown) {
        throw err;
    }
};
