import { IBatchRepository } from "../../repository/interface/IBatchRepository";
import { IBatchService } from "../interface/IBatchService";
import { IBatchSchema } from "../../entities/IBatchSchema";
import { ConflictError } from "@codeflare/common";

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
    async getBatches(): Promise<IBatchSchema[]> {
        try {
            return await this.batchRepository.find({});
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Adds a new batch with the specified name.
     * @param name - The name of the batch to add.
     * @returns A promise that resolves when the batch is added successfully.
     * @throws ConflictError if a batch with the same name already exists.
     * @throws An error if there is a problem adding the batch.
     */
    async addBatch(name: string): Promise<void> {
        try {
            const isBatchExist = await this.batchRepository.findOne({ name });

            if (isBatchExist) throw new ConflictError("Batch already exist!");

            await this.batchRepository.create({ name });
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the name of a batch with id `_id` to `name`.
     * @param _id - The id of the batch to update.
     * @param name - The new name for the batch.
     * @returns A promise that resolves to no value if successful, or an error if there is a problem updating the batch.
     */
    async updateBatch(_id: string, name: string): Promise<void> {
        try {
            await this.batchRepository.update({ _id }, { $set: { name } });
        } catch (err: unknown) {
            throw err;
        }
    }
}
