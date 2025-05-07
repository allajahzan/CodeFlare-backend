import { BadRequestError, IDomain } from "@codeflare/common";
import { IDomainDto, ISearchDomainsDto } from "../../dto/domainServiceDto";
import { IDomainsWeekSchema } from "../../entities/IDomainSchema";
import { IDomainRepository } from "../../repository/interface/IDomainRepository";
import { IDomainService } from "../interface/IDomainService";
import {
    cacheDomain,
    cacheUpdatedDomain,
    transformUpdatedDomainAndCache,
} from "../../utils/cacheDomain";

/** Implementation of Domain Service */
export class DomainService implements IDomainService {
    private domainRepository: IDomainRepository;

    /**
     * Constructs an instance of DomainService.
     * @param domainRepository - The domain repository to use for performing operations on domains.
     */
    constructor(domainRepository: IDomainRepository) {
        this.domainRepository = domainRepository;
    }

    /**
     * Adds a new domain with the given name, imageUrl, and weeks to the database.
     * @param name - The name of the domain to add.
     * @param imageUrl - The image url of the domain to add.
     * @param weeks - The list of weeks to add to the domain, where each week is an object with a "week" property and a "title" property.
     * @returns A promise that resolves to the added domain if successful, otherwise throws a BadRequestError.
     * @throws If there is a problem adding the domain to the database.
     */
    async addDomain(
        name: string,
        imageUrl: string,
        weeks: IDomainsWeekSchema[]
    ): Promise<IDomainDto> {
        try {
            const domain = await this.domainRepository.create({
                name,
                imageUrl,
                domainsWeeks: weeks,
            });

            if (!domain) throw new BadRequestError("Failed to add the domain!");

            // Populate week in domainsWeeks
            const populatedDomain: IDomain = await domain.populate({
                path: "domainsWeeks.week",
                model: "Week",
                select: "_id name",
            });

            // Map data to return type
            const domainDto: IDomainDto = {
                _id: populatedDomain._id as unknown as string,
                name: populatedDomain.name,
                imageUrl: populatedDomain.imageUrl,
                domainsWeeks: populatedDomain.domainsWeeks,
            };

            // Cache domain to redis
            await cacheDomain(domainDto);

            return domainDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates a domain with the given id.
     * @param domainId - The id of the domain to update.
     * @param name - The new name of the domain.
     * @param imageUrl - The new image url of the domain.
     * @returns A promise that resolves to void if successful, otherwise it throws an error.
     * @throws If there is a problem updating the domain.
     */
    async updateDomain(
        domainId: string,
        name: string,
        imageUrl: string
    ): Promise<void> {
        try {
            const isDomainExists = await this.domainRepository.findOne({
                _id: { $ne: domainId },
                name,
            });

            if (isDomainExists)
                throw new BadRequestError("This domain already exists!");

            const updatedDomain = await this.domainRepository.update(
                { _id: domainId },
                { $set: { name, imageUrl } },
                { new: true }
            );

            if (!updatedDomain)
                throw new BadRequestError("Failed to update the domain!");

            // Cache updated domain
            await transformUpdatedDomainAndCache(updatedDomain);
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Unlists a domain by setting its isDomainListed flag to false.
     * @param domainId - The ID of the domain to unlist.
     * @returns A promise that resolves to void if the unlisting is successful.
     * @throws {BadRequestError} If the domain cannot be unlisted.
     */
    async unlistDomain(domainId: string): Promise<void> {
        try {
            const updatedDomain = await this.domainRepository.update(
                { _id: domainId },
                { $set: { isDomainListed: false } },
                { new: true }
            );

            if (!updatedDomain)
                throw new BadRequestError("Failed to unlist the domain!");

            // Cache updated domain
            await transformUpdatedDomainAndCache(updatedDomain);
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Retrieves the weeks associated with a specified domain.
     * @param domainId - The ID of the domain to retrieve the weeks for.
     * @returns A promise that resolves to a domain DTO containing the domain's details and its weeks if successful, otherwise null.
     * @throws {BadRequestError} If the domain cannot be found or there is a problem retrieving the weeks.
     */
    async getWeeksInDomain(domainId: string): Promise<IDomainDto | null> {
        try {
            const domain = await this.domainRepository.findOne({ _id: domainId });

            if (!domain)
                throw new BadRequestError("Failed to get weeks in this domain!");

            // Populate week in domainsWeeks
            const populatedDomain: IDomain = await domain.populate({
                path: "domainsWeeks.week",
                model: "Week",
                select: "_id name",
            });

            // Map data to return type
            const domainDto: IDomainDto = {
                _id: populatedDomain._id as unknown as string,
                name: populatedDomain.name,
                imageUrl: populatedDomain.imageUrl,
                domainsWeeks: populatedDomain.domainsWeeks,
            };

            return domainDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Adds a list of weeks to the specified domain.
     * @param domainId - The id of the domain to which the weeks will be added.
     * @param weeks - An array of week objects, each containing a "week" and a "title" property.
     * @returns A promise that resolves to void if the operation is successful.
     * @throws {BadRequestError} If there is a problem adding the weeks to the domain.
     */
    async addWeeksToDomain(
        domainId: string,
        weeks: { week: string; title: string }[]
    ): Promise<void> {
        try {
            const updatedDomain = await this.domainRepository.addWeeksToDomain(
                domainId,
                weeks
            );

            if (!updatedDomain)
                throw new BadRequestError("Failed to add weeks to this domain!");

            // Cache updated domain
            await transformUpdatedDomainAndCache(updatedDomain);
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the title of a specific week in the domain's week list.
     * @param domainId - The ID of the domain containing the week to update.
     * @param week - The ID of the week to update.
     * @param title - The new title to set for the specified week.
     * @returns A promise that resolves when the update operation is complete.
     * @throws {BadRequestError} If the update operation fails.
     */
    async updateWeekInDomain(
        domainId: string,
        week: string,
        title: string
    ): Promise<void> {
        try {
            const updatedDomain = await this.domainRepository.updateWeekInDomain(
                domainId,
                week,
                title
            );

            if (!updatedDomain)
                throw new BadRequestError("Failed to update week in this domain!");

            // Cache updated domain
            await transformUpdatedDomainAndCache(updatedDomain);
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Unlists a specific week in the domain's week list.
     * @param domainId - The ID of the domain containing the week to unlist.
     * @param week - The ID of the week to unlist.
     * @returns A promise that resolves when the unlist operation is complete.
     * @throws {BadRequestError} If the unlist operation fails.
     */
    async unlistWeekInDomain(domainId: string, week: string): Promise<void> {
        try {
            const updatedDomain = await this.domainRepository.unlistWeekInDomain(
                domainId,
                week
            );

            if (!updatedDomain)
                throw new BadRequestError("Failed to unlist week in this domain!");

            // Cache updated domain
            await transformUpdatedDomainAndCache(updatedDomain);
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Searches for domains based on the provided keyword, sorting field, and order.
     * @param keyword - The keyword to search for in the domain's name.
     * @param sort - The field by which to sort the results.
     * @param order - The sorting order, either ascending (1) or descending (-1).
     * @returns A promise that resolves to an array of domain dtos matching the search criteria if successful, otherwise null.
     * @throws {BadRequestError} If the search operation fails.
     */
    async searchDomains(
        keyword: string,
        sort: string,
        order: number
    ): Promise<ISearchDomainsDto[] | null> {
        try {
            const domains = await this.domainRepository.searchDomains(
                keyword,
                sort,
                order
            );

            if (!domains || domains.length === 0) {
                return [];
            }

            return domains.map((domain) => ({
                _id: domain._id as unknown as string,
                name: domain.name,
                imageUrl: domain.imageUrl,
                isDomainListed: domain.isDomainListed,
                domainsWeeks: domain.domainsWeeks,
            }));
        } catch (err: unknown) {
            throw err;
        }
    }
}
