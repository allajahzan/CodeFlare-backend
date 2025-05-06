import { IStudent, IUser } from "@codeflare/common";

/** Dto for notification */
export interface INotificationDto {
    _id: string;
    senderId: string;
    sender?: IUser | IStudent;
    recieverId: string;
    type: string;
    path: string;
    message: string;
    date: Date;
}