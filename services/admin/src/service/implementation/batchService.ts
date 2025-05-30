import { IBatchRepository } from "../../repository/interface/IBatchRepository";
import { IBatchService } from "../interface/IBatchService";
import {
    BadRequestError,
    ConflictError,
    IStudent,
    IUser,
} from "@codeflare/common";
import { IBatchDto } from "../../dto/batchServiceDto";
import { cacheBatch, cacheUpdatedBatch } from "../../utils/cacheBatch";
import { getUsers } from "../../grpc/client/userClient";
import { ObjectId } from "mongoose";

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
     * Retrieves a list of batches based on the given type.
     * @param type - The type of batches to retrieve, either "unassigned" or "all".
     * @returns A promise that resolves to an array of batch objects if the batches are found, or an empty array if they are not.
     * @throws An error if there is a problem retrieving the batches.
     */
    async getBatches(type: string): Promise<IBatchDto[]> {
        try {
            const batches = await this.batchRepository.find({});

            if (!batches || !batches.length) {
                return [];
            }

            const batchDto: IBatchDto[] = [];

            if (type === "unassigned") {
                // Get usersMap from user service through gRPC
                let usersMap: Record<string, IUser | IStudent>;

                const resp = await getUsers([], "coordinator"); // Getuser by role

                if (resp.response && resp.response.status === 200) {
                    usersMap = resp.response.users;
                } else {
                    throw new Error();
                }

                // If usersMap is not empty
                if (usersMap && Object.keys(usersMap).length > 0) {
                    let assignedBatches: Set<string> = new Set();

                    // Get coordinators assigned batches
                    Object.values(usersMap).forEach((coordinator) => {
                        (coordinator as unknown as IUser).batches?.forEach((batch) => {
                            assignedBatches.add(batch);
                        });
                    });

                    // Get the available batches
                    for (let i = 0; i < batches.length; i++) {
                        if (!assignedBatches.has((batches[i]._id as ObjectId).toString())) {
                            batchDto.push({
                                _id: batches[i]._id as unknown as string,
                                name: batches[i].name,
                            });
                        }
                    }
                } else {
                    for (let i = 0; i < batches.length; i++) {
                        batchDto.push({
                            _id: batches[i]._id as unknown as string,
                            name: batches[i].name,
                        });
                    }
                }
            } else {
                for (let i = 0; i < batches.length; i++) {
                    batchDto.push({
                        _id: batches[i]._id as unknown as string,
                        name: batches[i].name,
                    });
                }
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
     * @throws An BadRequestError if there is a problem adding the batch.
     */
    async addBatch(name: string): Promise<IBatchDto> {
        try {
            const isBatchExist = await this.batchRepository.findOne({ name });

            if (isBatchExist) throw new ConflictError("This batch is already exist!");

            const newbatch = await this.batchRepository.create({ name });
            if (!newbatch) throw new BadRequestError("Failed to add the batch!");

            // Map data to return type
            const batchDto: IBatchDto = {
                _id: newbatch._id as unknown as string,
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
     * @throws An BadRequestError if there is a problem updating the batch.
     */
    async updateBatch(batchId: string, name: string): Promise<void> {
        try {
            const isBatchExist = await this.batchRepository.findOne({
                _id: { $ne: batchId },
                name,
            });

            if (isBatchExist) throw new ConflictError("This batch is already exist!");

            const updatedBatch = this.batchRepository.update(
                { _id: batchId },
                { $set: { name } }
            );

            if (!updatedBatch)
                throw new BadRequestError("Failed to update the batch!");

            // Map data
            const batchDto: IBatchDto = {
                _id: batchId as unknown as string,
                name,
            };

            // Cache updated batch to redis
            await cacheUpdatedBatch(batchDto);
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
            const batches = await this.batchRepository.searchBatches(
                keyword,
                sort,
                order
            );

            if (!batches || batches.length === 0) {
                return [];
            }

            const batchDto: IBatchDto[] = [];

            // Map data to return type
            for (let i = 0; i < batches.length; i++) {
                batchDto.push({
                    _id: batches[i]._id as unknown as string,
                    name: batches[i].name,
                });
            }

            return batchDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
