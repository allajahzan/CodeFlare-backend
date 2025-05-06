import { BaseRepository } from "@codeflare/common";
import { IWeekSchema } from "../../entities/IWeekSchema";
import { Model } from "mongoose";
import { IWeekRepository } from "../interface/IWeekRepository";

/** Implementation of Week Repository */
export class WeekRepository
    extends BaseRepository<IWeekSchema>
    implements IWeekRepository {
    /**
     * Constructor for WeekRepository
     * @param model - The Week model from Mongoose
     */
    constructor(model: Model<IWeekSchema>) {
        super(model);
    }

    /**
     * Searches for weeks based on the given keyword from the request query.
     * @param keyword - The keyword to search for in the week's name.
     * @param sort - The field to sort the results by.
     * @param order - The order of the sorting, either ascending (1) or descending (-1).
     * @returns A promise that resolves to an array of weeks matching the search criteria if successful, otherwise null.
     */
    async searchWeeks(
        keyword: string,
        sort: string,
        order: number
    ): Promise<IWeekSchema[] | null> {
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
