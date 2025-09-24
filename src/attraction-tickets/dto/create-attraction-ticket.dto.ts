import { IsArray, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";
export class CreateAttractionTicketDto {
    @IsNotEmpty({ message: 'ID dịch vụ không được bỏ trống' })
    service_id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Tên điểm tham quan không được bỏ trống' })
    attraction_name: string;

    @IsNotEmpty({ message: 'Địa điểm không được bỏ trống' })
    location: string;

    @IsNotEmpty({ message: 'Giá không được bỏ trống' })
    price: number;

    @IsNotEmpty({ message: 'Ngày bắt đầu không được bỏ trống' })
    valid_from: Date;

    @IsNotEmpty({ message: 'Ngày kết thúc không được bỏ trống' })
    valid_to: Date;

    @IsNotEmpty({ message: 'Loại vé không được bỏ trống' })
    ticket_type: string;

    @IsArray()
    @IsNotEmpty({ message: 'Phần bao gồm không được bỏ trống' })
    includes: string[];
}
