import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Họ tên không được bỏ trống' })
    name: string;

    @ApiProperty()
    @IsEmail({}, {message: 'Email không đúng định dạng'})
    @IsNotEmpty({ message: 'Email không được bỏ trống' })
    email: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    password: string;
    
    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày sinh không được bỏ trống' })
    birthDay: Date;

    @ApiProperty()
    @IsNotEmpty({ message: 'Giới tính không được bỏ trống' })
    gender: string;

    @ApiProperty()  
    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống' })
    address: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    role?: string;
}

export class RegisterUserDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Họ tên không được bỏ trống' })
    name: string;

    @ApiProperty()
    @IsEmail({}, {message: 'Email không đúng định dạng'})
    @IsNotEmpty({ message: 'Email không được bỏ trống' })
    email: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    password: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày sinh không được bỏ trống' })
    birthDay: Date;

    @ApiProperty()
    @IsNotEmpty({ message: 'Giới tính không được bỏ trống' })
    gender: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống' })
    address: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    role?: string;
}