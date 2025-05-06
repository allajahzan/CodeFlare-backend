import { IBaseRepository } from "@codeflare/common";
import { IWeekSchema } from "../../entities/IWeekSchema";

/** Inteface for Week Repository */
export interface IWeekRepository extends IBaseRepository<IWeekSchema> {
    searchWeeks(keyword: string, sort: string, order: number) : Promise<IWeekSchema[] | null>
}
