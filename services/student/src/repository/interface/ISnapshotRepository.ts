import { IBaseRepository } from "@codeflare/common";
import { ISnapshotSchema } from "../../entities/ISnapshot";

/** Interface for Snapshot Repository */
export interface ISnapshotRepository extends IBaseRepository<ISnapshotSchema> {}