import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreatePaymentDto {
    @IsNotEmpty({ message: 'ID đặt chỗ không được bỏ trống' })
    booking_id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Nhà cung cấp không được bỏ trống' })
    provider: string;

    @IsNotEmpty({ message: 'Số tiền không được bỏ trống' })
    amount: number;

    @IsNotEmpty({ message: 'Đơn vị tiền tệ không được bỏ trống' })
    currency: string;

    @IsNotEmpty({ message: 'Phương thức không được bỏ trống' })
    method: string;

    @IsNotEmpty({ message: 'Trạng thái không được bỏ trống' })
    status: string;
}
