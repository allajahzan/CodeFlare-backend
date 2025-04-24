import { IWarningDto } from "../../dto/warningDto";
import { IWarningSchema } from "../../entities/IWarning";

/** Interface for Warning Service */
export interface IWarningService {
    getWarnings(userId: string): Promise<IWarningDto[]>;
    createWarning(warning: IWarningSchema): Promise<IWarningDto>;
    replyToWarning(warningId: string, reply: string): Promise<IWarningDto>;
}