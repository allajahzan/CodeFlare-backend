import { IWeekDto } from "../../dto/weekServiceDto";

/** Interface for Week Service */
export interface IWeekService {
    getWeeks(): Promise<IWeekDto[]>;
    addWeek(name: string): Promise<IWeekDto>;
    updateWeek(weekId: string, name: string): Promise<void>;
    searchWeeks(keyword: string, sort: string, order: number): Promise<IWeekDto[]>;
}
