import mongoose from 'mongoose';
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

class Payment {
    @ApiProperty()
    @IsNotEmpty({ message: 'ID không được bỏ trống' })
    _id: mongoose.Schema.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số tiền không được bỏ trống' })
    amount: number;
    
    @ApiProperty()
    @IsNotEmpty({ message: 'Phương thức không được bỏ trống' })
    method: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Trạng thái không được bỏ trống' })
    status: string;
}

export class CreateBookingDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'ID tour không được bỏ trống' })
    tour_id: mongoose.Schema.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng khách không được bỏ trống' })
    numberOfGuests: number;
    
    @ApiProperty()
    bookingDate: Date;

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => Payment)
    payment?: Payment;
}
