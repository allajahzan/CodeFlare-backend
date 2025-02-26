import { BaseRepository } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../interface/IReviewRepository";

/** Implementation of Review Repository */
export class ReviewRepository extends BaseRepository<IReviewSchema> implements IReviewRepository{}