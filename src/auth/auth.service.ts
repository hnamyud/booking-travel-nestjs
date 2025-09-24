import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { IUser } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service'
import { Response } from 'express';
import { RegisterUserDto } from 'src/user/dto/create-user.dto';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if(user) {
        const isValid = this.usersService.isValidPassword(pass, user.password);
        if(isValid) {
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

  register = async(user: RegisterUserDto) => {
    let newUser = await this.usersService.register(user);
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
    await this.usersService.updateUserToken(refreshToken, _id);

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
    await this.usersService.updateUserToken(null, iuser._id.toString());
    return 'ok';
  }

  processToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      });

      let user = await this.usersService.queryUserByToken(refreshToken);
      if(!user) {
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

        await this.usersService.updateUserToken(newRefreshToken, _id.toString());
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
}
