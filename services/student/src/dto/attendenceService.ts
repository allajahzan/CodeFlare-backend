/** Dto for CheckIn */
export interface ICheckInDto {
    userId: string;
    date: Date;
    checkIn: Date;
    status: string;
}

/** Dto for CheckOut */
export interface ICheckOutDto {
    userId: string;
    date: Date;
    checkOut: Date;
    status: string;
}
