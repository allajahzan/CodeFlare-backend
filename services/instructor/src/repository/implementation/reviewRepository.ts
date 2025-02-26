import { BaseRepository } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../interface/IReviewRepository";
import { Model } from "mongoose";

/** Implementation of Review Repository */
export class ReviewRepository extends BaseRepository<IReviewSchema> implements IReviewRepository{
    /**
     * Constructs an instance of the ReviewRepository.
     * @param model - The mongoose model representing the review schema, used for database operations.
     */
    constructor(model: Model<IReviewSchema>){
        super(model)
    }
}