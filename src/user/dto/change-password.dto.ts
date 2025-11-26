import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Mật khẩu cũ không được bỏ trống' })
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mật khẩu mới không được bỏ trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được bỏ trống' })
  @IsString()
  confirmPassword: string;
}