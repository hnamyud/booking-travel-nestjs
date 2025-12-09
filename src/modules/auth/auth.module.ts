import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms from 'ms';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'src/shared/cache/redis.module';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/schema/user.schema';

@Module({
  imports: [
    UserModule, 
    PassportModule,
    RedisModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN'),
        signOptions: { expiresIn: ms(configService.get<string>('JWT_ACCESS_EXPIRED')) },
      }),
      inject: [ConfigService]
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, LocalStrategy, JwtStrategy,
    
  ],
  exports: [AuthService]
})
export class AuthModule {}
