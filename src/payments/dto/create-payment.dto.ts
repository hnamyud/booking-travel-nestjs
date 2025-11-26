import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreatePaymentDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'ID đặt chỗ không được bỏ trống' })
    booking_id: mongoose.Schema.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty({ message: 'Nhà cung cấp không được bỏ trống' })
    provider: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số tiền không được bỏ trống' })
    amount: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Đơn vị tiền tệ không được bỏ trống' })
    currency: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Phương thức không được bỏ trống' })
    method: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Trạng thái không được bỏ trống' })
    status: string;
}
