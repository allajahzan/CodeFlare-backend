/** Dto for review */
export interface IReviewDto {
    _id: string| unknown;
    userId: string;
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
    tech: number;
    theory: number;
}