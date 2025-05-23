import { redisClient, IDomain } from "@codeflare/common";
import { ObjectId } from "mongoose";

/**
 * Retrieves a domain from the cache.
 * @param domainId - The id of the domain to retrieve.
 * @returns A promise that resolves to a domain object if the domain is found in the cache, or undefined if it is not.
 * @throws An error if there is a problem retrieving the domain from the cache.
 */
export const getCachedDomain = async (domainId: string | ObjectId) => {
    try {
        const data = await redisClient.get("domains");
        if (!data) return null;

        const domains: IDomain[] = JSON.parse(data);

        return domains.find((d) => d._id === domainId?.toString()) || null;
    } catch (err) {
        console.log("Error fetching domain from cache:", err);
        throw err;
    }
};

/**
 * Retrieves an array of domains from the cache.
 * @param domainIds - The ObjectIds of the domains to retrieve.
 * @returns A promise that resolves to an array of domain objects if the domains are found in the cache, or an empty array if they are not.
 * @throws An error if there is a problem retrieving the domains from the cache.
 */
export const getCachedDomains = async (domainIds: ObjectId[]) => {
    try {
        const data = await redisClient.get("domains");

        if (!data) return [];

        const domains: IDomain[] = JSON.parse(data);

        // Convert ObjectId to string
        const domainIdStrings = domainIds.map((id) => id.toString());

        return domains.filter((d) => domainIdStrings.includes(d._id));
    } catch (err) {
        console.log("Error fetching domains from cache:", err);
        throw err;
    }
};
