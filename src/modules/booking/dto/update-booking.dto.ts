import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusBooking } from 'src/common/enum/status-booking.enum';
import { StatusPayment } from 'src/common/enum/status-payment.enum';

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
    @IsEnum(StatusBooking)
    status?: StatusBooking;

    @ApiProperty()
    @IsOptional()
    @IsEnum(StatusPayment)
    payment_status?: StatusPayment;

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
