// src/user/dto/update-role.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/enum/role.enum';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role của user',
    example: UserRole.User,
    enum: UserRole,
  })
  @IsNotEmpty({ message: 'Role không được để trống' })
  @IsEnum(UserRole, { 
    message: `Role phải là một trong: ${Object.values(UserRole).join(', ')}` 
  })
  role: string;
}