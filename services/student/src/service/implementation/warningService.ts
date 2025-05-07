import {
    BadRequestError,
    IStudent,
    IUser,
    NotFoundError,
} from "@codeflare/common";
import { IReply, IWarningDto } from "../../dto/warningDto";
import { IWarningSchema } from "../../entities/IWarning";
import { IWarningRepository } from "../../repository/interface/IWarningRepository";
import { IWarningService } from "../interface/IWarningService";
import { getUser } from "../../grpc/client/userClient";
import { WarningProducer } from "../../events/producer/warningProducer";

/** Implementation of Warning Service */
export class WarningService implements IWarningService {
    private warningRepository: IWarningRepository;

    /**
     * Constructs an instance of the WarningService.
     * @param warningRepository - The repository used for managing warning data.
     */
    constructor(warningRepository: IWarningRepository) {
        this.warningRepository = warningRepository;
    }

    /**
     * Retrieves the list of warnings for a student with the given user ID.
     * @param userId - The ID of the user to retrieve warnings for.
     * @returns A promise that resolves to the list of warnings as IWarningDto objects.
     * @throws {NotFoundError} If the user is not found.
     */
    async getWarnings(
        userId: string,
        month: string,
        year: number
    ): Promise<IWarningDto[]> {
        try {
            // Month map
            const monthMap: Record<string, number> = {
                January: 1,
                February: 2,
                March: 3,
                April: 4,
                May: 5,
                June: 6,
                July: 7,
                August: 8,
                September: 9,
                October: 10,
                November: 11,
                December: 12,
            };

            const warnings = await this.warningRepository.getWarnings(
                userId,
                monthMap[month],
                year
            );

            if (!warnings || warnings.length == 0) {
                return [];
            }

            // Map data ro return type
            const warningsDto: IWarningDto[] = warnings.map((warning) => ({
                _id: warning._id as unknown as string,
                studentId: warning.studentId.toString(),
                coordinatorId: warning.coordinatorId.toString(),
                message: warning.message,
                date: warning.date,
                createdAt: warning.createdAt,
                reply: warning.reply as IReply[],
            }));

            return warningsDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Creates a warning for a student in the system.
     * @param warning - The warning data to be created.
     * @returns A promise that resolves to the warning data transfer object.
     * @throws {BadRequestError} If the warning could not be created.
     */
    async createWarning(warning: IWarningSchema): Promise<IWarningDto> {
        try {
            // New warning
            const newWarning = await this.warningRepository.createWarning(warning);

            if (!newWarning)
                throw new BadRequestError("Failed to send warning to student !");

            // Coordinator info through gRPC
            let coordinator: IUser | IStudent;
            const resp = await getUser(newWarning.coordinatorId.toString());

            if (resp.response.status === 200) {
                coordinator = resp.response.user;
            } else {
                throw new NotFoundError("An unexpected error occurred !");
            }

            // Send warning event through rabbitmq
            const warningProducer = new WarningProducer(
                newWarning.coordinatorId as unknown as string,
                coordinator,
                newWarning.studentId as unknown as string,
                "Warning from coordinator regarding attendance."
            );

            // Publish event
            warningProducer.publish();

            // Map data ro return type
            const warningDto: IWarningDto = {
                _id: newWarning._id as unknown as string,
                studentId: newWarning.studentId.toString(),
                coordinatorId: newWarning.coordinatorId.toString(),
                message: newWarning.message,
                reply: newWarning.reply as IReply[],
                date: newWarning.date,
                createdAt: newWarning.createdAt,
            };

            return warningDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Sends a reply to a specific warning and updates the corresponding warning document in the database.
     * @param warningId - The ID of the warning to which the reply is to be added.
     * @param reply - The reply message to be added to the warning.
     * @returns A promise that resolves to the updated warning data transfer object if successful, otherwise throws an error.
     * @throws {BadRequestError} If the reply could not be sent to the coordinator.
     */
    async replyToWarning(warningId: string, reply: string): Promise<IWarningDto> {
        try {
            const warning = await this.warningRepository.replyToWarning(
                warningId,
                reply
            );

            if (!warning)
                throw new BadRequestError("Failed to send reply to coordinator !");

            const warningDto: IWarningDto = {
                _id: warning._id as unknown as string,
                studentId: warning.studentId.toString(),
                coordinatorId: warning.coordinatorId.toString(),
                message: warning.message,
                reply: warning.reply as IReply[],
                date: warning.date,
                createdAt: warning.createdAt,
            };

            return warningDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
