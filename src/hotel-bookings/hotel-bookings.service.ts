import { Injectable } from '@nestjs/common';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';

@Injectable()
export class HotelBookingsService {
  create(createHotelBookingDto: CreateHotelBookingDto) {
    return 'This action adds a new hotelBooking';
  }

  findAll() {
    return `This action returns all hotelBookings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hotelBooking`;
  }

  update(id: number, updateHotelBookingDto: UpdateHotelBookingDto) {
    return `This action updates a #${id} hotelBooking`;
  }

  remove(id: number) {
    return `This action removes a #${id} hotelBooking`;
  }
}
