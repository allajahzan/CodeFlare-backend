import { BaseRepository } from "@codeflare/common";
import { IDomainSchema } from "../../entities/IDomainSchema";
import { IDomainRepository } from "../interface/IDomainRepository";
import { Model } from "mongoose";

/** Implementation of Domain Repository */
export class DomainRepository
    extends BaseRepository<IDomainSchema>
    implements IDomainRepository {
    /**
     * Constructor for DomainRepository
     * @param model - The Mongoose model for the Domain schema.
     */
    constructor(model: Model<IDomainSchema>) {
        super(model);
    }

    /**
     * Adds a list of weeks to the given domainId.
     * @param domainId - The id of the domain to add the weeks to.
     * @param weeks - The list of weeks to add, where each week is an object with a string "week" property and a string "title" property.
     * @returns The updated domain if successful, otherwise null.
     * @throws If there is a problem adding the weeks to the domain.
     */
    async addWeeksToDomain(
        domainId: string,
        weeks: { week: string; title: string }[]
    ): Promise<IDomainSchema | null> {
        try {
            return await this.model.findOneAndUpdate(
                { _id: domainId },
                { $push: { domainsWeeks: { $each: weeks } } },
                { new: true }
            );
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Updates the title of a specific week in the domainsWeeks array for the given domainId.
     * @param domainId - The id of the domain containing the week to update.
     * @param week - The id of the week to update.
     * @param title - The new title to set for the specified week.
     * @returns A promise that resolves to the updated domain schema if successful, otherwise null.
     * @throws If there is a problem updating the week in the domain.
     */
    async updateWeekInDomain(
        domainId: string,
        week: string,
        title: string
    ): Promise<IDomainSchema | null> {
        try {
            return await this.model.findOneAndUpdate(
                { _id: domainId, "domainsWeeks.week": week },
                { $set: { "domainsWeeks.$.title": title } },
                { new: true }
            );
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Unlists a specific week in the domainsWeeks array for the given domainId.
     * @param domainId - The id of the domain containing the week to unlist.
     * @param week - The id of the week to unlist.
     * @returns A promise that resolves to the updated domain schema if successful, otherwise null.
     * @throws If there is a problem unlisting the week in the domain.
     */
    async unlistWeekInDomain(
        domainId: string,
        week: string
    ): Promise<IDomainSchema | null> {
        try {
            return await this.model.findOneAndUpdate(
                { _id: domainId, "domainsWeeks.week": week },
                { $set: { "domainsWeeks.$.isWeekListed": false } },
                { new: true }
            );
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Searches for domains based on the provided keyword, sorting field, and order.
     * @param keyword - The keyword to search for in the domain's name.
     * @param sort - The field by which to sort the results.
     * @param order - The sorting order, either ascending (1) or descending (-1).
     * @returns A promise that resolves to an array of domain schemas matching the search criteria if successful, otherwise null.
     */
    async searchDomains(
        keyword: string,
        sort: string,
        order: number
    ): Promise<IDomainSchema[] | null> {
        try {
            return await this.model.aggregate([
                {
                    $match: keyword
                        ? {
                            $or: [{ name: { $regex: keyword, $options: "i" } }],
                        }
                        : {},
                },
                {
                    $sort: {
                        [sort]: order === 1 ? 1 : -1,
                    },
                },
            ]);
        } catch (err: unknown) {
            return null;
        }
    }
}
