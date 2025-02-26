/** Dto for review */
export interface IReviewDto {
    _id: string | unknown;
    userId: string;
    batchId: string;
    title: string;
    week: string;
    date: Date;
    time: string;
    rating: number;
    feedback: string;
    pendings: string[];
    score: {
        tech: number;
        theory: number;
    };
    status: string;
    result: string;
}
