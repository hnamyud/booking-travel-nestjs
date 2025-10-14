import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelBookingsController } from './hotel-bookings.controller';
import { HotelBooking, HotelBookingSchema } from './schemas/hotel-booking.schema';
import { HotelBookingsService } from './hotel-bookings.service';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HotelBooking.name, schema: HotelBookingSchema }]),
    CaslModule
  ],
  controllers: [HotelBookingsController],
  providers: [HotelBookingsService]
})
export class HotelBookingsModule {}
