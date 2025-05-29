import { IBatch, IReviewCategory, IStudent, IUser, IWeek } from "@codeflare/common";

/** Dto for review */
export interface IReviewDto {
    _id: string;
    instructor: IUser;
    student: IStudent,
    batch?: IBatch;
    week?: IWeek;
    title: string;
    date: Date;
    time: string;
    category: IReviewCategory;
    feedback: string;
    pendings: string[];
    score: { practical: number; theory: number };
    status: string;
    result: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}