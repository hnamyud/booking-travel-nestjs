import mongoose from 'mongoose';
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

class Image {
    @IsNotEmpty({ message: 'URL không được bỏ trống' })
    url: string;

    @IsNotEmpty({ message: 'Public ID không được bỏ trống' })
    public_id: string;
}

class Tour {
    @IsNotEmpty({ message: 'ID không được bỏ trống' })
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Tên tour không được bỏ trống' })
    name: string;

    @IsNotEmpty({ message: 'Giá tour không được bỏ trống' })
    price: number;
}

export class CreateDestinationDto {
    @IsNotEmpty({ message: 'Tên địa điểm không được bỏ trống' })
    name: string;
    
    @IsNotEmpty({ message: 'Quốc gia không được bỏ trống' })
    country: string;

    @IsNotEmpty({ message: 'Mô tả không được bỏ trống' })
    description: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => Image)
    images?: Image[];
    
    @IsOptional()
    @ValidateNested()
    @Type(() => Tour)
    tours?: Tour[];
}
