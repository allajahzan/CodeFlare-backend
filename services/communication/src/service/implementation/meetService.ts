import { NotFoundError } from "@codeflare/common";
import { IMeetDto } from "../../dto/meetServiceDto";
import { IMeetRepository } from "../../repository/interface/IMeetRepository";
import { IMeetService } from "../interface/IMeetService";
import { ObjectId } from "mongoose";
import { IMeetSchema } from "../../entities/IMeetSchema";

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
    async getMeetById(_id: string): Promise<IMeetDto | null> {
        try {
            const meet = await this.meetRepository.findOne({ _id });
            if (!meet)
                throw new NotFoundError("Meet with this link doesn't exists !");

            // Map data to return type
            const meetDto: IMeetDto = {
                _id: meet._id as unknown as ObjectId,
                hostId: meet.hostId,
                roomId: meet.roomId,
                invitedUsers: meet.invitedUsers,
                messages: meet.messages,
            };

            return meetDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Creates a new meet document with the specified host ID.
     * @param hostId - The ID of the host creating the meet.
     * @returns A promise that resolves to the created meet document if successful, otherwise null.
     * @throws An error if the creation fails.
     */
    async createMeet(hostId: string): Promise<IMeetSchema | null> {
        try {
            const meet = await this.meetRepository.create({
                hostId: hostId as unknown as ObjectId,
            });

            return meet;
        } catch (err: unknown) {
            throw err;
        }
    }
}
