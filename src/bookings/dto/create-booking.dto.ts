import mongoose from 'mongoose';
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

class Payment {
    @IsNotEmpty({ message: 'ID không được bỏ trống' })
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Số tiền không được bỏ trống' })
    amount: number;
    
    @IsNotEmpty({ message: 'Phương thức không được bỏ trống' })
    method: string;

    @IsNotEmpty({ message: 'Trạng thái không được bỏ trống' })
    status: string;
}

export class CreateBookingDto {
    @IsNotEmpty({ message: 'ID tour không được bỏ trống' })
    tour_id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Số lượng khách không được bỏ trống' })
    numberOfGuests: number;
    
    bookingDate: Date;

    @IsOptional()
    @ValidateNested()
    @Type(() => Payment)
    payment?: Payment;
}
