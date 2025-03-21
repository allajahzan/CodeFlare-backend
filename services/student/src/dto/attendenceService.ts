/** Dto for CheckIn */
export interface ICheckInOutDto {
    userId: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: string;
}
