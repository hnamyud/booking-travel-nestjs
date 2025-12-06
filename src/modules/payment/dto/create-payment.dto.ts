import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import mongoose from "mongoose";

export class CreatePaymentDto {
    @ApiProperty({ 
        description: 'ID của Booking cần thanh toán',
        example: '60d5ecb8b392d7001f3e1234' 
    })
    @IsNotEmpty({ message: 'ID đặt chỗ không được bỏ trống' })
    @IsMongoId({ message: 'ID đặt chỗ phải là định dạng MongoID hợp lệ' })
    booking_id: string; // DTO nhận string, Service sẽ convert sang ObjectId sau

    @ApiProperty({ 
        description: 'Nhà cung cấp thanh toán (VNPAY, STRIPE, CASH...)',
        example: 'VNPAY' 
    })
    @IsNotEmpty({ message: 'Nhà cung cấp không được bỏ trống' })
    @IsString()
    provider: string;

    @ApiProperty({ 
        description: 'Số tiền cần thanh toán',
        example: 100000 
    })
    @IsNotEmpty({ message: 'Số tiền không được bỏ trống' })
    @IsNumber({}, { message: 'Số tiền phải là dạng số' })
    @Min(1000, { message: 'Số tiền tối thiểu là 1.000 VNĐ' }) // VNPAY yêu cầu tối thiểu
    @Type(() => Number) // Ensure transform string to number nếu form-data
    amount: number;

    @ApiPropertyOptional({ 
        description: 'Đơn vị tiền tệ',
        default: 'VND',
        example: 'VND' 
    })
    @IsOptional()
    @IsString()
    currency?: string = 'VND'; // Set default value ngay tại DTO hoặc Service

    @ApiPropertyOptional({
        description: 'Thông tin thêm (Mã ngân hàng, ngôn ngữ, ghi chú...)',
        example: { bankCode: 'NCB', language: 'vn' }
    })
    @IsOptional()
    metadata?: Record<string, any>;
}
