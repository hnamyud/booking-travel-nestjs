import { Module } from '@nestjs/common';
import { HotelBookingsService } from './hotel-bookings.service';
import { HotelBookingsController } from './hotel-bookings.controller';

@Module({
  controllers: [HotelBookingsController],
  providers: [HotelBookingsService]
})
export class HotelBookingsModule {}
