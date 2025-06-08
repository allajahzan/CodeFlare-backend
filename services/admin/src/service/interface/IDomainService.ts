import { IWeek } from "@codeflare/common";
import { IDomainDto, ISearchDomainsDto } from "../../dto/domainServiceDto";
import { IDomainsWeekSchema } from "../../entities/IDomainSchema";

/** Interface for Domain Service */
export interface IDomainService {
    addDomain(name: string, weeks: IDomainsWeekSchema[], lastWeek: IWeek): Promise<IDomainDto>;
    updateDomain(domainId: string, name: string, weeks: IDomainsWeekSchema[], lastWeek: IWeek): Promise<IDomainDto>;
    unlistDomain(domainId: string): Promise<void>;
    getWeeksInDomain(domainId: string): Promise<IDomainDto | null>;
    // addWeeksToDomain(domainId: string, weeks: { week: string; title: string }[]): Promise<void>;
    // updateWeekInDomain(domainId: string, week: string, title: string): Promise<void>;
    // unlistWeekInDomain(domainId: string, week: string): Promise<void>;
    searchDomains(keyword: string, sort: string, order: number): Promise<ISearchDomainsDto[] | null>;
}