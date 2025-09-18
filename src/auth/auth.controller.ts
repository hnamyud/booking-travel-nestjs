import { Controller, Post, UseGuards, Req, Body, Res, Get } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize.decorator';
import { LocalAuthGuard } from 'src/local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/user/dto/create-user.dto';
import { Response, Request } from 'express';
import { IUser } from 'src/user/user.interface';


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("User login")
  @Post('/login')
  handleLogin(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage("Register a new User")
  @Post('/register')
  create(@Body() RegisterUserDto: RegisterUserDto) { 
    return this.authService.register(RegisterUserDto);
  }

  @Get('/account')
  @ResponseMessage("Get user information")
  handleGetAccount(@User() user: IUser) {
    return { user };
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
  @ResponseMessage("User logout")
  handleLogout(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.logout(req.user, response);
  }
}
