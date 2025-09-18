import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HotelBookingsService } from './hotel-bookings.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';

@Controller('hotel-bookings')
export class HotelBookingsController {
  constructor(private readonly hotelBookingsService: HotelBookingsService) {}

  @Post()
  create(@Body() createHotelBookingDto: CreateHotelBookingDto) {
    return this.hotelBookingsService.create(createHotelBookingDto);
  }

  @Get()
  findAll() {
    return this.hotelBookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelBookingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHotelBookingDto: UpdateHotelBookingDto) {
    return this.hotelBookingsService.update(+id, updateHotelBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelBookingsService.remove(+id);
  }
}
