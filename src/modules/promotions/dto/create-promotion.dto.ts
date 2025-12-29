import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { DiscountType } from "src/common/enum/discount-type.enum";

export class CreatePromotionDto {
    @ApiProperty({
        description: 'Mã khuyến mãi',
        example: 'SUMMER2026'
    })
    @IsNotEmpty({ message: 'Mã khuyến mãi không được bỏ trống' })
    @IsString()
    code: string;

    @ApiProperty({
        description: 'Loại khuyến mãi (PERCENTAGE hoặc FIXED_AMOUNT)',
        example: 'PERCENTAGE'
    })
    @IsNotEmpty({ message: 'Loại khuyến mãi không được bỏ trống' })
    @IsEnum([DiscountType.Percentage, DiscountType.FixedAmount], { message: 'Loại khuyến mãi không hợp lệ' })
    discountType: string;

    @ApiProperty({
        description: 'Giá trị khuyến mãi',
        example: 10
    })
    @IsNumber({}, { message: 'Giá trị khuyến mãi phải là dạng số' })
    @IsNotEmpty({ message: 'Giá trị khuyến mãi không được bỏ trống' })
    discountValue: number;

    @ApiProperty({
        description: 'Giá trị khuyến mãi tối đa áp dụng (dành cho khuyến mãi theo phần trăm)',
        example: 5000000
    })
    @IsNumber({}, { message: 'Giá trị khuyến mãi tối đa phải là dạng số' })
    @IsNotEmpty({ message: 'Giá trị khuyến mãi tối đa không được bỏ trống' })
    maxDiscountAmount: number;

    @ApiProperty({
        description: 'Giá trị đặt chỗ tối thiểu để áp dụng khuyến mãi',
        example: 20000000
    })
    @IsNumber({}, { message: 'Giá trị đặt chỗ tối thiểu phải là dạng số' })
    @IsNotEmpty({ message: 'Giá trị đặt chỗ tối thiểu không được bỏ trống' })
    minBookingValue: number;

    @ApiProperty({
        description: 'Giới hạn số lần sử dụng khuyến mãi',
        example: 100
    })
    @IsNumber({}, { message: 'Giới hạn số lần sử dụng phải là dạng số' })
    @IsNotEmpty({ message: 'Giới hạn số lần sử dụng không được bỏ trống' })
    usageLimit: number;

    @ApiProperty({
        description: 'Ngày bắt đầu áp dụng khuyến mãi',
        example: '2024-06-01T00:00:00Z'
    })
    @Type(() => Date)
    @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
    startDate: Date;

    @ApiProperty({
        description: 'Ngày kết thúc áp dụng khuyến mãi',
        example: '2024-06-30T23:59:59Z'
    })
    @Type(() => Date)
    @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
    endDate: Date;

    @ApiProperty({
        description: 'Trạng thái kích hoạt của khuyến mãi',
        example: true
    })
    @IsNotEmpty({ message: 'Trạng thái kích hoạt không được bỏ trống' })
    @IsBoolean()
    isActive: boolean;
}
