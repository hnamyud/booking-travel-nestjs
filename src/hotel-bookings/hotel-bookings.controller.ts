import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { HotelBookingsService } from './hotel-bookings.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';
import { Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { Action } from 'src/enum/action.enum';
import { HotelBooking } from './schemas/hotel-booking.schema';

@Controller('hotel-bookings')
@UseGuards(PoliciesGuard)
export class HotelBookingsController {
  constructor(private readonly hotelBookingsService: HotelBookingsService) {}

  @Post()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Create, HotelBooking),
    message: 'Bạn không có quyền tạo mới Hotel Booking'
  })
  @ResponseMessage('Create a hotel booking successfully')
  async create(@Body() createHotelBookingDto: CreateHotelBookingDto) {
    const newHotelBooking = await this.hotelBookingsService.create(createHotelBookingDto);
    return {
      id: newHotelBooking?._id,
      createdAt: newHotelBooking?.createdAt,
    };
  }

  @Get()
  @Public()
  @ResponseMessage('Hotel bookings retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.hotelBookingsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Hotel booking retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.hotelBookingsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, HotelBooking),
    message: 'Bạn không có quyền cập nhật Hotel Booking'
  })
  @ResponseMessage('Update a hotel booking successfully')
  update(@Param('id') id: string, @Body() updateHotelBookingDto: UpdateHotelBookingDto) {
    return this.hotelBookingsService.update(id, updateHotelBookingDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, HotelBooking),
    message: 'Bạn không có quyền xóa Hotel Booking'
  })
  @ResponseMessage('Delete a hotel booking successfully')
  remove(@Param('id') id: string) {
    return this.hotelBookingsService.remove(id);
  }
}
