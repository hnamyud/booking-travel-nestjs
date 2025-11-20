import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được bỏ trống' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được bỏ trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được bỏ trống' })
  @IsString()
  confirmPassword: string;
}