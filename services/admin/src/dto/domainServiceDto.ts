import { IDomainsWeek } from "@codeflare/common";
import { IDomainsWeekSchema } from "../entities/IDomainSchema";

/** Dto for domain */
export interface IDomainDto {
    _id: string;
    name: string;
    imageUrl: string;
    domainsWeeks: IDomainsWeek[];
}

/** Dto for searchDomains */
export interface ISearchDomainsDto {
    _id: string;
    name: string;
    imageUrl: string;
    isDomainListed: boolean;
    domainsWeeks: IDomainsWeekSchema[];
}