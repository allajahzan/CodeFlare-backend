// Interfac for IUser
export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    profilePic: string;
}

/** Dto for review */
export interface IReviewDto {
    _id: string | unknown;
    user: IUser,
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
    updatedAt: Date;
}
