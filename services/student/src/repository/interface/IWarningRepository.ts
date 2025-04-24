import { IBaseRepository } from "@codeflare/common";
import { IWarningSchema } from "../../entities/IWarning";

/** Interface for Warning Repository */
export interface IWarningRepository extends IBaseRepository<IWarningSchema> {
    createWarning(warning: IWarningSchema): Promise<IWarningSchema | null>;
    replyToWarning(warningId: string, reply: string): Promise<IWarningSchema | null>;
}