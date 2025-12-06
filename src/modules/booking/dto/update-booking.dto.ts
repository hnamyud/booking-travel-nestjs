import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ContactInfoDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    email?: string;
}
export class UpdateBookingDto {
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
