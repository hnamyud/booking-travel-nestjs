import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HotelBookingsService } from './hotel-bookings.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';
import { ResponseMessage } from 'src/decorator/customize.decorator';

@Controller('hotel-bookings')
export class HotelBookingsController {
  constructor(private readonly hotelBookingsService: HotelBookingsService) {}

  @Post()
  @ResponseMessage('Create a hotel booking successfully')
  async create(@Body() createHotelBookingDto: CreateHotelBookingDto) {
    const newHotelBooking = await this.hotelBookingsService.create(createHotelBookingDto);
    return {
      id: newHotelBooking?._id,
      createdAt: newHotelBooking?.createdAt,
    };
  }

  @Get()
  @ResponseMessage('Hotel bookings retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.hotelBookingsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Hotel booking retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.hotelBookingsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a hotel booking successfully')
  update(@Param('id') id: string, @Body() updateHotelBookingDto: UpdateHotelBookingDto) {
    return this.hotelBookingsService.update(id, updateHotelBookingDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete a hotel booking successfully')
  remove(@Param('id') id: string) {
    return this.hotelBookingsService.remove(id);
  }
}
