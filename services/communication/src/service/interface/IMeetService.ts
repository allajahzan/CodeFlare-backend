import { IMeetDto, IRoomIdDto } from "../../dto/meetServiceDto";

/** Interface for Meet Service */
export interface IMeetService {
    getMeetById(roomId: string): Promise<IMeetDto>;
    createMeet(hostId: string) : Promise<IRoomIdDto>
}
