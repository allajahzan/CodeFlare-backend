import { BadRequestError, ConflictError } from "@codeflare/common";
import { IWeekDto } from "../../dto/weekServiceDto";
import { WeekRepository } from "../../repository/implementation/weekRepository";
import { IWeekRepository } from "../../repository/interface/IWeekRepository";
import { IWeekService } from "../interface/IWeekService";
import { cacheUpdatedWeek, cacheWeek } from "../../utils/cacheWeek";

/** Implementation of Week Service */
export class WeekService implements IWeekService {
    private weekRepository: IWeekRepository;

    /**
     * Constructs an instance of WeekService.
     * @param {IWeekRepository} weekRepository The repository used for managing week data.
     */
    constructor(weekRepository: IWeekRepository) {
        this.weekRepository = weekRepository;
    }

    /**
     * Retrieves the list of weeks.
     * @returns A promise that resolves to a list of weeks as IWeekDto objects.
     * @throws {NotFoundError} If there is a problem retrieving the weeks.
     */
    async getWeeks(): Promise<IWeekDto[]> {
        try {
            const weeks = await this.weekRepository.find({});

            // Map data to return type
            const weeksDto: IWeekDto[] = weeks.map((week) => {
                return {
                    _id: week._id as unknown as string,
                    name: week.name,
                };
            });

            return weeksDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Adds a new week to the database.
     * @param {string} name The name of the week to add.
     * @returns A promise that resolves to the newly added week as an IWeekDto object.
     * @throws {ConflictError} If the week with the given name already exists.
     * @throws {BadRequestError} If there is a problem adding the week to the database.
     */
    async addWeek(name: string): Promise<IWeekDto> {
        try {
            const isWeekExists = await this.weekRepository.findOne({ name });
            if (isWeekExists) throw new ConflictError("This week is already exist!");

            const newWeek = await this.weekRepository.create({ name });
            if (!newWeek) throw new BadRequestError("Failed to add the week!");

            // Map data to return type
            const weekDto: IWeekDto = {
                _id: newWeek._id as unknown as string,
                name: newWeek.name,
            };

            // Cache week to redis
            await cacheWeek(weekDto);

            return weekDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the name of an existing week with the given weekId.
     * @param weekId - The id of the week to update.
     * @param name - The new name to set for the week.
     * @returns A promise that resolves when the week is updated successfully.
     * @throws {ConflictError} If a week with the given name already exists.
     * @throws {BadRequestError} If there is a problem updating the week.
     */
    async updateWeek(weekId: string, name: string): Promise<void> {
        try {
            console.log(weekId,name)
            const isWeekExists = await this.weekRepository.findOne({
                _id: { $ne: weekId },
                name,
            });

            if (isWeekExists) throw new ConflictError("This week is already exists!");

            const updatedWeek = await this.weekRepository.update(
                { _id: weekId },
                { $set: { name } }
            );

            if (!updatedWeek) throw new BadRequestError("Failed to update the week!");

            // Map data
            const weekDto: IWeekDto = {
                _id: updatedWeek._id as unknown as string,
                name: updatedWeek.name,
            };

            // Cache updated week to redis
            await cacheUpdatedWeek(weekDto);
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Searches for weeks based on the given keyword from the request query.
     * @param keyword - The keyword to search for in the week's name.
     * @param sort - The field to sort the results by.
     * @param order - The order of the sorting, either ascending (1) or descending (-1).
     * @returns A promise that resolves to an array of weeks matching the search criteria if successful, otherwise an empty array.
     * @throws An error if there is a problem searching for the weeks.
     */
    async searchWeeks(
        keyword: string,
        sort: string,
        order: number
    ): Promise<IWeekDto[]> {
        try {
            const weeks = await this.weekRepository.searchWeeks(keyword, sort, order);

            if (!weeks || weeks.length === 0) {
                return [];
            }

            const weeksDto: IWeekDto[] = [];

            // Map data to return type
            for (let i = 0; i < weeks.length; i++) {
                weeksDto.push({
                    _id: weeks[i]._id as unknown as string,
                    name: weeks[i].name,
                });
            }

            return weeksDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
