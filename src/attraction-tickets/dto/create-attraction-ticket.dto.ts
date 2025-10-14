import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Image {
    @IsNotEmpty({ message: 'URL không được bỏ trống' })
    url: string;

    @IsNotEmpty({ message: 'Public ID không được bỏ trống' })
    public_id: string;
}

export class CreateAttractionTicketDto {
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

    @IsOptional()
    @ValidateNested()
    @Type(() => Image)
    images?: Image[];

    @IsArray()
    @IsNotEmpty({ message: 'Phần bao gồm không được bỏ trống' })
    includes: string[];
}
