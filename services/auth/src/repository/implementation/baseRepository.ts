import { Document, FilterQuery, Model, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository";

/** Implementaion of Base Repository */
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    private readonly modal: Model<T>;

    /**
     * Constructs an instance of BaseRepository.
     * @param modal - The modal of type T which will be used by the repository.
     */
    constructor(modal: Model<T>) {
        this.modal = modal;
    }

    /**
     * Finds multiple documents in the database that match the given query.
     * @param query - The query to filter the documents.
     * @returns A promise that resolves to an array of documents that match the query.
     *          If an error occurs, it returns an empty array.
     */
    async find(query: FilterQuery<T>): Promise<T[] | []> {
        try {
            return await this.modal.find(query);
        } catch (err: any) {
            return [];
        }
    }

    /**
     * Finds a single document in the database that matches the given query.
     * @param query - The query to filter the documents.
     * @returns A promise that resolves to the document that matches the query if found, otherwise null.
     */
    async findOne(query: FilterQuery<T>): Promise<T | null> {
        try {
            return await this.modal.findOne(query);
        } catch (err) {
            return null;
        }
    }

    /**
     * Creates a new document in the database using the provided data.
     * @param data - Partial data of type T to create the document.
     * @returns A promise that resolves to the newly created document if successful, otherwise null.
     */
    async create(data: Partial<T>): Promise<T | null> {
        try {
            const createdDocument = new this.modal(data);
            return await createdDocument.save();
        } catch (err) {
            return null;
        }
    }

    /**
     * Updates a single document in the database that matches the given query.
     * @param query - The query to filter the documents.
     * @param data - The data to update the document with.
     * @returns A promise that resolves to the updated document if successful, otherwise null.
     */
    async update(query: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
        try {
            const updatedDocument = await this.modal.findOneAndUpdate(query, data);
            return updatedDocument;
        } catch (err) {
            return null;
        }
    }

    /**
     * Deletes a single document in the database that matches the given query.
     * @param query - The query to filter the documents.
     * @returns A promise that resolves to the deleted document if successful, otherwise null.
     */
    async delete(query: FilterQuery<T>): Promise<T | null> {
        try {
            const deletedDocument = await this.modal.findOneAndDelete(query);
            return deletedDocument;
        } catch (err) {
            return null;
        }
    }
}
