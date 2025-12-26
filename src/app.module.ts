import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { CaslModule } from './core/abilities/casl.module';
import { RedisModule } from './shared/cache/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppThrottlerGuard } from './core/guards/app-throttler.guard';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DestinationModule } from './modules/destination/destination.module';
import { TourModule } from './modules/tour/tour.module';
import { ReviewModule } from './modules/review/review.module';
import { PaymentsModule } from './modules/payment/payments.module';
import { BookingsModule } from './modules/booking/bookings.module';
import { LoggerMiddleware } from './core/middleware/logger.middleware';
import { HashAlgorithm, ignoreLogger } from 'vnpay';
import { VnpayModuleOptions } from './modules/vnpay/interfaces/vnpay-module-option.interface';
import { VnpayModule } from './modules/vnpay';
import { ScheduleModule } from '@nestjs/schedule';
import { CloudinaryModule } from './shared/upload/cloudinary.module';
import { MailModule } from './shared/mailer/mail.module';
import { SeedModule } from './seed/seed.module';
import { StatisticModule } from './modules/statistic/statistic.module';


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
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short', // ✅ Thêm name
          ttl: 60000,    // 60 seconds = 1 minute
          limit: 20,    // ✅ Tăng lên 100 requests/minute (reasonable cho app)
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
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<VnpayModuleOptions> => ({
        tmnCode: configService.get('VNPAY_TMN_CODE'),
        secureSecret: configService.get('VNPAY_SECRET_KEY'),
        vnpayHost: configService.get('VNPAY_HOST', 'https://sandbox.vnpayment.vn'),
        testMode: configService.get('NODE_ENV') !== 'production',
        hashAlgorithm: HashAlgorithm.SHA512,
        loggerFn: ignoreLogger,
        enableLog: true,
      }),
      inject: [ConfigService],
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
    RedisModule,
    SeedModule,
    StatisticModule
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
export class AppModule { 
  // Configure middleware globally
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
