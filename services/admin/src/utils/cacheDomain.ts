import { IDomain, redisClient } from "@codeflare/common";
import { IDomainDto } from "../dto/domainServiceDto";
import { DomainRepository } from "../repository/implementation/domainRepository";
import Domain from "../model/domain";
import { IDomainSchema } from "../entities/IDomainSchema";

/**
 * Caches the given domain in the domains key in Redis.
 * @param domain - The domain to cache.
 */
export const cacheDomain = async (domain: IDomainDto) => {
    try {
        const data = await redisClient.get("domains");
        const domains = data ? JSON.parse(data) : [];

        await redisClient.set("domains", JSON.stringify([...domains, domain]));

        console.log(domain, "New domain cached");
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Updates the cache with the given domain in the domains key in Redis.
 * If the domain already exists in the cache, it replaces the existing entry.
 * @param domain - The domain to update in the cache.
 * @throws Will throw an error if there is a problem with the caching process.
 */
export const cacheUpdatedDomain = async (domain: IDomainDto) => {
    try {
        const data = await redisClient.get("domains");
        const domains = data ? JSON.parse(data) : [];

        const updatedDomains = domains.map((d: IDomainDto) => {
            if (d._id === domain._id) {
                return domain;
            } else {
                return d;
            }
        });

        await redisClient.set("domains", JSON.stringify(updatedDomains));

        console.log(domain, "Updated domain cached");
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Caches all domains in the domains key in Redis.
 * Retrieves all domains from the database, populates the weeks in each domain, and caches the transformed domains.
 * @throws Will throw an error if there is a problem with the caching process.
 */
export const cacheAllDomains = async () => {
    try {
        const domains = await new DomainRepository(Domain).find({});

        const tranformedDomains: IDomainDto[] = await Promise.all(
            domains.map(async (d) => {
                // Populate weeks in domainsWeek
                const populatedDomain: IDomain = await d.populate([
                    {
                        path: "domainsWeeks.week",
                        model: "Week",
                        select: "_id name",
                    },
                    {
                        path: "lastWeek",
                        model: "Week",
                        select: "_id name",
                    },
                ]);

                return {
                    _id: populatedDomain._id,
                    name: populatedDomain.name,
                    domainsWeeks: populatedDomain.domainsWeeks,
                    lastWeek: populatedDomain.lastWeek,
                    isListed: populatedDomain.isListed,
                };
            })
        );

        await redisClient.set("domains", JSON.stringify(tranformedDomains));
        console.log("All domains cached");
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Transforms the provided updated domain by populating its weeks,
 * maps it to a domain DTO, and updates the cache with the transformed domain.
 * @param updatedDomain - The updated domain schema to be transformed and cached.
 * @throws Will throw an error if there is an issue during the transformation or caching process.
 */
export const transformDomainAndCache = async (
    domain: IDomainSchema,
    type: "add" | "update"
) => {
    try {
        // Populate week in domainsWeeks
        const populatedDomain: IDomain = await domain.populate([
            {
                path: "domainsWeeks.week",
                model: "Week",
                select: "_id name",
            },
            {
                path: "lastWeek",
                model: "Week",
                select: "_id name",
            },
        ]);

        // Map data
        const domainDto: IDomainDto = {
            _id: populatedDomain._id as unknown as string,
            name: populatedDomain.name,
            domainsWeeks: populatedDomain.domainsWeeks.map((w) => {
                return {
                    week: w.week,
                    title: w.title,
                };
            }),
            lastWeek: populatedDomain.lastWeek,
            isListed: populatedDomain.isListed,
        };

        if (type === "add") {
            // Cache new domain to redis
            await cacheDomain(domainDto);
        } else {
            // Cache updated domain to redis
            await cacheUpdatedDomain(domainDto);
        }

        return domainDto;
    } catch (err: unknown) {
        throw err;
    }
};
