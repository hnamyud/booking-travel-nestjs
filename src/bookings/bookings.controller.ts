import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ResponseMessage, User } from 'src/decorator/customize.decorator';
import { IUser } from 'src/user/user.interface';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ResponseMessage('Create a new Booking')
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @User() user: IUser
  ) {
    const newBooking = await this.bookingsService.create(createBookingDto, user);
    return {
      id: newBooking?.id,
      createdAt: newBooking?.createdAt
    }
  }

  @Get()
  @ResponseMessage('Fetch all bookings')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.bookingsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch booking by id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a Booking')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete a Booking')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
