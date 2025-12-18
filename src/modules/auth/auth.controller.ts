import { Controller, Post, UseGuards, Req, Body, Res, Get, BadRequestException } from '@nestjs/common';
import { Public, ResponseMessage, GetUser } from 'src/core/decorator/customize.decorator';
import { LocalAuthGuard } from 'src/core/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { IUser } from 'src/common/interfaces/user.interface';
import { ResetPasswordDto, VerifyOtpDto } from './dto/reset-password.dto';
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from '../user/dto/create-user.dto';
import { GoogleAuthGuard } from 'src/core/guards/google-auth.guard';
import { resolve } from 'path';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private configService: ConfigService
  ) { }

  @Post('/login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("User login")
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      default: {
        summary: 'Login',
        value: {
          email: 'admin@gmail.com',
          password: '123456'
        }
      }
    }
  })
  handleLogin(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.login(req.user, response);
  }

  @Post('/register')
  @Public()
  @ResponseMessage("Register a new User")
  @ApiBody({ type: RegisterUserDto })
  @ApiProperty({ type: RegisterUserDto })
  create(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.register(RegisterUserDto);
  }

  @Get('/google/login')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ResponseMessage("Google login")
  handleGoogleLogin() {
    // This route will redirect to Google for authentication
  }

  @Get('/google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ResponseMessage("Google callback")
  async handleGoogleCallback(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) response: Response
  ) {
    const request = await this.authService.login(req.user, response);
    response.redirect(this.configService.get('BROWSER_REDIRECT_URI') + request.access_token);
  }

  @Get('/account')
  @ApiBearerAuth('access-token')
  @ResponseMessage("Get user information")
  handleGetAccount(@GetUser() user: IUser) {
    return this.userService.getProfile(user);
  }

  @Get('/refresh')
  @Public()
  @ResponseMessage("Get user by refresh token")
  handleRefresh(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = req.cookies['refresh_token'];
    return this.authService.processToken(refreshToken, response);
  }

  @Post('/logout')
  @ApiBearerAuth('access-token')
  @ResponseMessage("User logout")
  handleLogout(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.logout(req.user, response);
  }

  @Post('/verify-admin')
  @ApiBearerAuth('access-token')
  @ResponseMessage('Verify admin access')
  async verifyAdmin(@GetUser() user: IUser) {
    return this.authService.verifyAdminAccess(user);
  }

  @Post('/verify-moderator')
  @ApiBearerAuth('access-token')
  @ResponseMessage('Verify moderator access')
  async verifyModerator(@GetUser() user: IUser) {
    return this.authService.verifyModeratorAccess(user);
  }

  @Post('/verify-otp')
  @Public()
  @ResponseMessage("Verify OTP")
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const isValid = await this.authService.verifyOtpOnly(verifyOtpDto.email, verifyOtpDto.otp);
    if (!isValid) throw new BadRequestException('Invalid OTP or OTP has expired!');
    return { message: 'Success!' };
  }

  @Post('/reset-password')
  @Public()
  @ResponseMessage("Reset password")
  async handleResetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
