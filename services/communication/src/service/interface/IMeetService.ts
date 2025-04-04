import { IMeetDto } from "../../dto/meetServiceDto";
import { IMeetSchema } from "../../entities/IMeetSchema";

/** Interface for Meet Service */
export interface IMeetService {
    getMeetById(_id: string): Promise<IMeetDto | null>;
    createMeet(hostId: string) : Promise<IMeetSchema | null>
}
