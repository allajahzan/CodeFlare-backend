import { IBaseRepository } from "@codeflare/common";
import { IDomainSchema } from "../../entities/IDomainSchema";

/** Inteface for Domain Repository */
export interface IDomainRepository extends IBaseRepository<IDomainSchema> {
    addWeeksToDomain(domainId: string, weeks: { week: string; title: string }[]): Promise<IDomainSchema | null>
    updateWeekInDomain(domainId: string, week: string, title: string): Promise<IDomainSchema | null>
    unlistWeekInDomain(domainId: string, week: string): Promise<IDomainSchema | null>
    searchDomains(keyword: string, sort: string, order: number): Promise<IDomainSchema[] | null>
}
