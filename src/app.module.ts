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
import { ServicesModule } from './services/services.module';
import { FlightTicketsModule } from './flight-tickets/flight-tickets.module';
import { HotelBookingsModule } from './hotel-bookings/hotel-bookings.module';
import { AttractionTicketsModule } from './attraction-tickets/attraction-tickets.module';


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
    ServicesModule,
    FlightTicketsModule,
    HotelBookingsModule,
    AttractionTicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
