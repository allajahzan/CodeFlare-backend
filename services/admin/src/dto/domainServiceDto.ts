import { IDomainsWeek } from "@codeflare/common";
import { IDomainsWeekSchema } from "../entities/IDomainSchema";

/** Dto for domain */
export interface IDomainDto {
    _id: string;
    name: string;
    domainsWeeks: IDomainsWeek[];
    isListed: boolean;
}

/** Dto for searchDomains */
export interface ISearchDomainsDto {
    _id: string;
    name: string;
    domainsWeeks: IDomainsWeekSchema[];
    isListed: boolean;
}