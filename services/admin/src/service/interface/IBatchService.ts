import { IBatchDto } from "../../dto/batchServiceDto";

/** Interface for Batch Service */
export interface IBatchService {
    getBatches(): Promise<IBatchDto[]>;
    addBatch(name: string): Promise<IBatchDto>;
    updateBatch(batchId: string, name: string): Promise<void>;
    searchBatches(keyword: string, sort: string, order: number): Promise<IBatchDto[]>;
}
