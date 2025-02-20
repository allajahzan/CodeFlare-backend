import { IBatchDto } from "../../dto/batchServiceDto";
import { IBatchSchema } from "../../entities/IBatchSchema";

/** Interface for Batch Service */
export interface IBatchService {
    getBatches(): Promise<IBatchDto[]>;
    addBatch(name: string): Promise<IBatchDto>;
    updateBatch(_id: string, name: string): Promise<void>;
}
