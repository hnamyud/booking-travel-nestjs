import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateTourDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên tour không được bỏ trống' })
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Thời gian không được bỏ trống' })
    @IsString()
    duration: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số ngày không được bỏ trống' })
    @IsNumber()
    @Min(1, { message: 'Số ngày phải lớn hơn 0' })
    durationDays: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Giá không được bỏ trống' })
    @IsNumber()
    @Min(0, { message: 'Giá không được âm' })
    price: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Thời gian bắt đầu không được bỏ trống' })
    @Type(() => Date)
    @IsDate()
    timeStart: Date;

    @ApiProperty()
    @IsNotEmpty({ message: 'Thời gian kết thúc không được bỏ trống' })
    @Type(() => Date)
    @IsDate()
    timeEnd: Date;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'Số chỗ phải lớn hơn 0' })
    totalSlots: number;

    @ApiProperty()
    @IsOptional()
    isAvailable?: boolean;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsMongoId({ each: true, message: 'ID địa điểm không hợp lệ' })
    destinations?: string[];
}
