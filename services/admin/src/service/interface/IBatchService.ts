import { IBatchSchema } from "../../entities/IBatchSchema";

/** Interface for Batch Service */
export interface IBatchService {
    getBatches(): Promise<IBatchSchema[]>;
    addBatch(name: string): Promise<void>;
    updateBatch(_id: string, name: string): Promise<void>;
}
