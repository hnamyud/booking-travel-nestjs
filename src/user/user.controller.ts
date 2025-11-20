import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser, Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { IUser } from './user.interface';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { Action } from 'src/enum/action.enum';
import { User } from './schema/user.schema';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
@UseGuards(PoliciesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Create, User),
    message: 'Bạn không có quyền tạo mới User'
  })
  @ResponseMessage("Create a new User")
  async create(
    @Body() createUserDto: CreateUserDto, 
    @GetUser() iuser: IUser
  ) {
    let newUser = await this.userService.create(createUserDto, iuser);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    };
  }

  @Get()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Read_All, User),
    message: 'Bạn không có quyền xem tất cả danh sách User'
  })
  @ResponseMessage("Fetch user with paginate")
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.userService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage("Fetch user by id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Get user profile (Use POST)
  @Post('profile')
  @ResponseMessage("Fetch user profile")
  getProfile(@GetUser() user: IUser) {
    return this.userService.getProfile(user);
  }

  @Patch('change-password')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, User),
    message: 'Bạn không có quyền thay đổi mật khẩu'
  })
  @ResponseMessage('Change password successfully')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: IUser
  ) {
    // Kiểm tra confirm password
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }

    const id = user._id;

    return this.userService.changePassword(
      user,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword
    );
  }

  // Update user role
  @Patch(':id/role')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Manage, User),
    message: 'Chỉ admin mới có quyền thay đổi role'
  })
  @ResponseMessage('Update user role successfully')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @GetUser() user: IUser
  ) {
    return this.userService.updateRole(id, role, user);
  }

  // Update user info
  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, User),
    message: 'Bạn không có quyền cập nhật User'
  })
  @ResponseMessage("Update a User")
  update(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: IUser,
    @Param('id') id: string
  ) {
    const updateUser = this.userService.update(id, updateUserDto, user);
    return updateUser;
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, User),
    message: 'Bạn không có quyền xóa User'
  })
  @ResponseMessage("Delete a User")
  remove(
    @Param('id') id: string,
    @GetUser() user: IUser
  ) {
    return this.userService.remove(id, user);
  }
}
