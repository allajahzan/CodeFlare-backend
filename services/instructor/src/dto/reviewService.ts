import { IBatch } from "@codeflare/common";

// Interface for student review
export interface IStudentReview {
    _id: string;
    name: string;
    email: string;
    role: string;
    profilePic: string;
    batch?: IBatch;
}

// Interface for instructor review
export interface IInstutructorReview {
    _id: string;
    name: string;
    email: string;
    role: string;
    profilePic: string;
}

/** Dto for review */
export interface IReviewDto {
    _id: string | unknown;
    user: IStudentReview,
    instructor: IInstutructorReview;
    batchId: string;
    title: string;
    week: string;
    date: Date;
    time: string;
    rating: number;
    feedback: string;
    pendings: string[];
    score: { practical: number; theory: number };
    status: string;
    result: string;
    updatedAt: Date;
}
