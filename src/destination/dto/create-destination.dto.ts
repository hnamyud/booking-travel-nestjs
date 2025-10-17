import mongoose from 'mongoose';
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { TagType } from 'src/enum/tag-type.enum';

class Image {
    @IsNotEmpty({ message: 'URL không được bỏ trống' })
    url: string;

    @IsNotEmpty({ message: 'Public ID không được bỏ trống' })
    public_id: string;
}

export class CreateDestinationDto {
    @IsNotEmpty({ message: 'Tên địa điểm không được bỏ trống' })
    name: string;
    
    @IsNotEmpty({ message: 'Quốc gia không được bỏ trống' })
    country: string;

    @IsNotEmpty({ message: 'Mô tả không được bỏ trống' })
    description: string;

    @IsEnum(TagType, { each: true })
    @IsOptional()
    tags?: TagType[];

    @IsOptional()
    @ValidateNested()
    @Type(() => Image)
    images?: Image[];
}
