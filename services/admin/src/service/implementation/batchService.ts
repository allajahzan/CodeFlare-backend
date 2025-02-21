import { IBatchRepository } from "../../repository/interface/IBatchRepository";
import { IBatchService } from "../interface/IBatchService";
import { ConflictError } from "@codeflare/common";
import { IBatchDto } from "../../dto/batchServiceDto";
import { ObjectId } from "mongoose";
import { cacheBatch } from "../../utils/catchBatch";

/** Implementaion of Batch Service */
export class BatchService implements IBatchService {
    private batchRepository: IBatchRepository;

    /**
     * Constructs an instance of the BatchService.
     * @param batchRepository - The repository used for managing batch data.
     */
    constructor(batchRepository: IBatchRepository) {
        this.batchRepository = batchRepository;
    }

    /**
     * Retrieves the list of batches.
     * @returns A promise that resolves to an array of batch documents.
     * @throws An error if there is a problem retrieving the batches.
     */
    async getBatches(): Promise<IBatchDto[]> {
        try {
            const batches = await this.batchRepository.find({});

            const batchDto: IBatchDto[] = [];

            for (let i = 0; i < batches.length; i++) {
                batchDto.push({
                    _id: batches[i]._id as unknown as ObjectId,
                    name: batches[i].name,
                });
            }

            return batchDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Adds a new batch with the specified name.
     * @param name - The name of the batch to add.
     * @returns A promise that resolves when the batch is added successfully.
     * @throws A ConflictError if a batch with the same name already exist.
     * @throws An error if there is a problem adding the batch.
     */
    async addBatch(name: string): Promise<IBatchDto> {
        try {
            const isBatchExist = await this.batchRepository.findOne({ name });

            if (isBatchExist) throw new ConflictError("This batch is already exist!");

            const newbatch = await this.batchRepository.create({ name });
            if (!newbatch) throw new Error("Failed to add the batch!");

            // Map data to return type
            const batchDto: IBatchDto = {
                _id: newbatch._id as unknown as ObjectId,
                name: newbatch.name,
            };

            // Cache batch to redis
            await cacheBatch(batchDto);

            return batchDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the name of a batch with the given id.
     * @param _id - The id of the batch to update.
     * @param name - The new name of the batch.
     * @returns A promise that resolves when the batch is updated successfully.
     * @throws An error if there is a problem updating the batch.
     */
    async updateBatch(_id: string, name: string): Promise<void> {
        try {
            const isBatchExist = await this.batchRepository.findOne({
                _id: { $ne: _id },
                name,
            });

            if (isBatchExist) throw new ConflictError("This batch is already exist!");

            const updatedBatch = this.batchRepository.update(
                { _id },
                { $set: { name } }
            );

            if (!updatedBatch) throw new Error("Failed to update the batch!");
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Searches for batches based on the given keyword from the request query.
     * @param keyword - The keyword to search for in the batch's name.
     * @param sort - The field to sort the results by.
     * @param order - The order of the sorting, either ascending (1) or descending (-1).
     * @returns A promise that resolves to an array of batches matching the search criteria if successful, otherwise an empty array.
     * @throws An error if there is a problem searching for the batches.
     */
    async searchBatches(
        keyword: string,
        sort: string,
        order: number
    ): Promise<IBatchDto[]> {
        try {
            const batches = await this.batchRepository.searchBatch(
                keyword,
                sort,
                order
            );

            return batches ? (batches as IBatchDto[]) : [];
        } catch (err: unknown) {
            throw err;
        }
    }
}
