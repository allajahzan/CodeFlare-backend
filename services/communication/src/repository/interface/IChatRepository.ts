import { IBaseRepository } from "@codeflare/common";
import { IChatSchema } from "../../entities/IChatSchema";

/** Interface for Chat Repository */
export interface IChatRepository extends IBaseRepository<IChatSchema> {}