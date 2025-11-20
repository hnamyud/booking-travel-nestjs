import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'role'] as const)) {
    @IsString({message: 'Họ tên phải là chuỗi ký tự'})
    @IsOptional()
    name: string;
    
    @IsEmail({}, {message: 'Email không đúng định dạng'})
    @IsOptional()
    email: string;
    
    @Type(() => Date)
    @IsDate({message: 'Ngày sinh không đúng định dạng'})
    @IsOptional()
    birthDay: Date;
    
    @IsString({message: 'Giới tính phải là chuỗi ký tự'})
    @IsOptional()
    gender: string;
    
    @IsString({message: 'Địa chỉ phải là chuỗi ký tự'})
    @IsOptional()
    address: string;
    
    @IsString({message: 'Password phải là chuỗi ký tự'})
    @IsOptional()
    old_password: string;

    @IsString({message: 'Password phải là chuỗi ký tự'})
    @IsOptional()
    new_password: string;
}

