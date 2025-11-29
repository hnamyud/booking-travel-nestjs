import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { DestinationModule } from './destination/destination.module';
import { TourModule } from './tour/tour.module';
import { ReviewModule } from './review/review.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module';
import { CaslModule } from './casl/casl.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Scheduler } from 'rxjs';
import { AppThrottlerGuard } from './auth/app-throttler.guard';


@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        }
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short', // ✅ Thêm name
          ttl: 60000,    // 60 seconds = 1 minute
          limit: 10,    // ✅ Tăng lên 100 requests/minute (reasonable cho app)
        },
        {
          name: 'medium', // ✅ Multiple throttlers
          ttl: 1800000,    // 30 minutes  
          limit: 500,     // 500 requests/10 minutes
        },
        {
          name: 'long',   // ✅ Long term protection
          ttl: 3600000,   // 1 hour
          limit: 1000,    // 1000 requests/hour
        }
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UserModule,
    AuthModule,
    DestinationModule,
    TourModule,
    ReviewModule,
    CloudinaryModule,
    PaymentsModule,
    BookingsModule,
    CaslModule,
    MailModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    }
  ],
})
export class AppModule { }
