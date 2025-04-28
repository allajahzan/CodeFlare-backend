// Interface for replay
export interface IReply {
    message: string;
    date: Date;
}

/** Dto for Warning */
export interface IWarningDto {
    _id: string,
    studentId: string;
    coordinatorId: string;
    message: string;
    reply: IReply[];
    date: Date;
    createdAt: Date;
}
