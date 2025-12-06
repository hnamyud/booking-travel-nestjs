import mongoose from 'mongoose';
import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

class ContactInfoDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    email?: string;
}

export class CreateBookingDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'ID tour không được bỏ trống' })
    @IsMongoId({ message: 'ID Tour không hợp lệ' })
    tour_id: mongoose.Schema.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng khách không được bỏ trống' })
    numberOfGuests: number;

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => ContactInfoDto)
    contactInfo?: ContactInfoDto;

    @ApiProperty()
    @IsOptional()
    @IsString()
    note?: string;
}
