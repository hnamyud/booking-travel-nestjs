import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

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

export class UpdateDestinationDto {

    @IsOptional()
    name?: string;

    @IsOptional()
    country?: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => Image)
    images?: Image[];
        
    @IsOptional()
    @ValidateNested()
    @Type(() => Tour)
    tours?: Tour[];
}
