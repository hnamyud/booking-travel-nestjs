import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'role'] as const)) {
    @ApiProperty()
    @IsString({message: 'Họ tên phải là chuỗi ký tự'})
    @IsOptional()
    name: string;
    
    @ApiProperty()
    @IsEmail({}, {message: 'Email không đúng định dạng'})
    @IsOptional()
    email: string;
    
    @ApiProperty()
    @Type(() => Date)
    @IsDate({message: 'Ngày sinh không đúng định dạng'})
    @IsOptional()
    birthDay: Date;
    
    @ApiProperty()
    @IsString({message: 'Giới tính phải là chuỗi ký tự'})
    @IsOptional()
    gender: string;
    
    @ApiProperty()
    @IsString({message: 'Địa chỉ phải là chuỗi ký tự'})
    @IsOptional()
    address: string;
}

