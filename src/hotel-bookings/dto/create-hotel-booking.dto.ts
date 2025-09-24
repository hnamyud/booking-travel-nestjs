import { IsArray, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateHotelBookingDto {
    @IsNotEmpty({ message: 'ID dịch vụ không được bỏ trống' })
    service_id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Tên khách sạn không được bỏ trống' })
    hotel_name: string;

    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống' })
    address: string;

    @IsNotEmpty({ message: 'Loại phòng không được bỏ trống' })
    room_type: string;

    @IsNotEmpty({ message: 'Ngày nhận phòng không được bỏ trống' })
    check_in_date: Date;

    @IsNotEmpty({ message: 'Ngày trả phòng không được bỏ trống' })
    check_out_date: Date;

    @IsNotEmpty({ message: 'Tiện nghi không được bỏ trống' })
    @IsArray({ message: 'Tiện nghi phải là một mảng' })
    amenities: string[];
}
