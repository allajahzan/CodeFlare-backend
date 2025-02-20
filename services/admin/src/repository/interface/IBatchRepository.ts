import { IBaseRepository } from "@codeflare/common";
import { IBatchSchema } from "../../entities/IBatchSchema";

/** Inteface for Batch Repository */
export interface IBatchRepository extends IBaseRepository<IBatchSchema> {
    searchBatch(keyword: string, sort: string, order: number) : Promise<IBatchSchema[] | null>
}
