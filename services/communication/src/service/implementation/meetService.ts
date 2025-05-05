import { IStudent, IUser, NotFoundError } from "@codeflare/common";
import { IMeetDto, IRoomIdDto } from "../../dto/meetServiceDto";
import { IMeetRepository } from "../../repository/interface/IMeetRepository";
import { IMeetService } from "../interface/IMeetService";
import { ObjectId } from "mongoose";
import { IMeetSchema } from "../../entities/IMeetSchema";
import { getUser } from "../../grpc/client/userClient";

/** Implementation for Meet Service */
export class MeetService implements IMeetService {
    private meetRepository: IMeetRepository;

    /**
     * Constructor for MeetService
     * @param meetRepository - The IMeetRepository instance to use for data access
     */
    constructor(meetRepository: IMeetRepository) {
        this.meetRepository = meetRepository;
    }

    /**
     * Retrieves a meet document by its id.
     * @param _id - The id of the meet
     * @returns A promise that resolves to the meet document if found, otherwise null if the meet is not found.
     * @throws {NotFoundError} If the meet with the given id doesn't exist
     */
    async getMeetById(roomId: string): Promise<IMeetDto> {
        try {
            const meet = await this.meetRepository.findOne({ roomId });
            if (!meet)
                throw new NotFoundError("This meeting link doesn't even exists !");

            // Get host details
            const resp = await getUser(meet.hostId as unknown as string);

            let host: IUser | IStudent;

            // Success response
            if (resp.response && resp.response.status === 200) {
                host = resp.response.user;
            } else {
                throw new NotFoundError("Host not found !");
            }

            // Map data to return type
            const meetDto: IMeetDto = {
                _id: meet._id as unknown as string,
                host: {
                    _id: host._id,
                    name: host.name,
                    email: host.email,
                    role: host.role,
                    profilePic: host.profilePic,
                },
                hostId: meet.hostId as unknown as string,
                roomId: meet.roomId,
                invitedUsers: meet.invitedUsers as unknown as string[],
                messages: meet.messages,
            };

            return meetDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Creates a new meet document with the specified host ID.
     * @param hostId - The id of the host user
     * @returns A promise that resolves to the roomId of the created meet document if successful, otherwise throws an error.
     * @throws {NotFoundError} If the host with the given id doesn't exist
     */
    async createMeet(hostId: string): Promise<IRoomIdDto> {
        try {
            const meet = await this.meetRepository.create({
                hostId: hostId as unknown as ObjectId,
            });

            if (!meet) throw new NotFoundError("Unable to create meet!");

            // Mapping data to return type
            const roomIdDto: IRoomIdDto = {
                roomId: meet.roomId,
            };

            return roomIdDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
