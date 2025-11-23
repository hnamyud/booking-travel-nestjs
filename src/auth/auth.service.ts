import { VerifyOtpDto, ResetPasswordDto } from './dto/reset-password.dto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { IUser } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service'
import { Response } from 'express';
import { RegisterUserDto } from 'src/user/dto/create-user.dto';
import Redis from 'ioredis';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    if (user) {
      const isValid = this.userService.isValidPassword(pass, user.password);
      if (isValid) {
        return user;
      }
    }
    return null;
  }

  createRefreshToken = (payload) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRED')) / 1000
    });
    return refreshToken;
  }

  register = async (user: RegisterUserDto) => {
    let newUser = await this.userService.register(user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  login = async (iuser: IUser, response: Response) => {
    const { _id, name, email, role } = iuser;
    const payload = {
      sub: "Access token",
      iss: "Nekko",
      _id,
      name,
      email,
      role
    }

    const refreshToken = this.createRefreshToken(payload);
    await this.userService.updateUserToken(refreshToken, _id);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRED'))
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role
      }
    }
  }

  logout = async (iuser: IUser, response: Response) => {
    // Clear refresh token in cookie
    response.clearCookie('refresh_token');
    await this.userService.updateUserToken(null, iuser._id.toString());
    return 'ok';
  }

  processToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      });

      let user = await this.userService.queryUserByToken(refreshToken);
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      } else {
        const { _id, email, name, role } = user;
        const payload = {
          sub: 'Token refresh',
          iss: 'Nekko',
          _id,
          email,
          name,
          role
        };
        const newRefreshToken = this.createRefreshToken(payload);

        await this.userService.updateUserToken(newRefreshToken, _id.toString());
        // Clear cookie cũ trước khi set
        response.clearCookie('refresh_token');
        // Set new cookie
        response.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRED'))
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role
          }
        };
      }
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  // Verify OTP dùng cho quên mật khẩu
  verifyOtpOnly = async (email: string, otp: string) => {
    const redisKey = `reset_otp:${email}`;
    const attemptsKey = `reset_otp_attempts:${email}`;
    const attempts = await this.redisClient.get(attemptsKey);

    // Kiểm tra số lần thử
    if (attempts && parseInt(attempts) >= 5) {
      await this.redisClient.del(redisKey); // Xoá OTP khỏi Redis
      await this.redisClient.del(attemptsKey);
      throw new BadRequestException('Bạn đã thử quá nhiều lần. Vui lòng yêu cầu mã OTP mới.');
    }

    const storedOtp = await this.redisClient.get(redisKey);
    if (!storedOtp) {
      throw new BadRequestException('Invalid OTP or OTP has expired!');
    }
    if(storedOtp !== otp){
      // Tăng số lần thử
      await this.redisClient.incr(attemptsKey);

      // Set thời gian sống cho key đếm này (ví dụ 5 phút = bằng thời gian OTP)
      await this.redisClient.expire(attemptsKey, 300);
      throw new BadRequestException('Invalid OTP!');
    }

    // Nếu đúng thì xóa key đếm đi (để lần sau user reset tiếp không bị dính limit cũ)
    await this.redisClient.del(attemptsKey);
    return true;
  }

  // Reset password dùng cho quên mật khẩu
  resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    // Kiểm tra OTP và limit thử
    await this.verifyOtpOnly(resetPasswordDto.email, resetPasswordDto.otp);
    
    const redisKey = `reset_otp:${resetPasswordDto.email}`;
    
    const user = await this.userService.findOneByEmail(resetPasswordDto.email);
    if (!user) {
      // Case hiếm: Có OTP trong Redis nhưng User lại bị xóa khỏi DB rồi
      throw new BadRequestException('Người dùng không tồn tại.');
    }
    const hashPassword = await this.userService.getHashPassword(resetPasswordDto.newPassword);  
    await this.userService.updateUserPassword(resetPasswordDto.email, hashPassword);
    // Xoá OTP sau khi đổi mật khẩu thành công
    await this.redisClient.del(redisKey);
  }
}
