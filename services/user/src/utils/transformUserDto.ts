import { IUserDto } from "../dto/userServiceDto";
import { IUserSchema } from "../entities/IUserSchema";
import { getCachedBatches } from "./cachedBatch";
import { getCachedDomains } from "./cachedDomain";
import { getCachedWeeks } from "./cachedWeek";

/**
 * Retrieves an array of users with their batch details from the cache.
 * @param users - The list of users to retrieve batch details for.
 * @returns A promise that resolves to an array of user objects with their batch details.
 * @throws An error if there is a problem retrieving the batch details from the cache.
 */
export const getTransformedUserDto = async (
    users: IUserSchema[]
): Promise<IUserDto[]> => {
    try {
        // plane users
        const planeUsers = users.map((user) =>
            user.toObject ? user.toObject() : user
        );

        // Unique batch ids
        const uniqueBatchIds = [
            ...new Set(
                planeUsers.flatMap((user) => [
                    ...(user.batches?.length ? user.batches : []),
                    ...(user.batch ? [user.batch] : []),
                ])
            ),
        ];

        // Unique week ids
        const uniqueWeekIds = [
            ...new Set(
                planeUsers.flatMap((user) => [...(user.week ? [user.week] : [])])
            ),
        ];

        // Unique domain ids
        const uniqueDomainIds = [
            ...new Set(
                planeUsers.flatMap((user) => [...(user.domain ? [user.domain] : [])])
            ),
        ];

        // Fetch batch details from cache
        const cachedBatches = await getCachedBatches(uniqueBatchIds);

        // Fetch week details from cache
        const cachedWeeks = await getCachedWeeks(uniqueWeekIds);

        // Fetch domain detials from cache
        const cachedDomains = await getCachedDomains(uniqueDomainIds);

        // Map planeUsers with batch details
        const mappedUsers: IUserDto[] = planeUsers.map((user: IUserSchema) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            ...(user.phoneNo ? { phoneNo: user.phoneNo } : {}),
            ...(user.week
                ? {
                    week:
                        cachedWeeks.find((w) => w._id === user.week.toString()) || null,
                }
                : {}),
            ...(user.domain
                ? {
                    domain:
                        cachedDomains.find((d) => d._id === user.domain.toString()) ||
                        null,
                }
                : {}),
            ...(user.batch
                ? {
                    batch:
                        cachedBatches.find((b) => b._id === user.batch.toString()) ||
                        null,
                }
                : {}),
            ...(user.batches?.length
                ? {
                    batches: cachedBatches.filter((cachedBatch) =>
                        user.batches.some(
                            (batchId) => batchId.toString() === cachedBatch._id
                        )
                    ),
                }
                : {}),
            ...(user.category ? { category: user.category } : {}),
            ...(user.lastActive ? { lastActive: user.lastActive } : {}),
            createdAt: user.createdAt,
            isBlock: user.isBlock,
        }));

        return mappedUsers;
    } catch (err) {
        throw err;
    }
};
