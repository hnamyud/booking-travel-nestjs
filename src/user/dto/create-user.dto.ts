import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'Họ tên không được bỏ trống' })
    name: string;

    @IsEmail({}, {message: 'Email không đúng định dạng'})
    @IsNotEmpty({ message: 'Email không được bỏ trống' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    password: string;

    @IsNotEmpty({ message: 'Ngày sinh không được bỏ trống' })
    birthDay: Date;

    @IsNotEmpty({ message: 'Giới tính không được bỏ trống' })
    gender: string;

    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống' })
    address: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    role?: string;
}

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Họ tên không được bỏ trống' })
    name: string;

    @IsEmail({}, {message: 'Email không đúng định dạng'})
    @IsNotEmpty({ message: 'Email không được bỏ trống' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    password: string;

    @IsNotEmpty({ message: 'Ngày sinh không được bỏ trống' })
    birthDay: Date;

    @IsNotEmpty({ message: 'Giới tính không được bỏ trống' })
    gender: string;

    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống' })
    address: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    role?: string;
}