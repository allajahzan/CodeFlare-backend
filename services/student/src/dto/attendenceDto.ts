/** Dto for CheckIn */
export interface ICheckInOutDto {
    userId: string;
    date: Date;
    checkIn?: string;
    checkOut?: string;
    status: string;
}
