import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ResponseMessage, GetUser } from 'src/decorator/customize.decorator';
import { IUser } from 'src/user/user.interface';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { Action } from 'src/enum/action.enum';
import { Booking } from './schemas/booking.schema';

@Controller('bookings')
@UseGuards(PoliciesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Create, Booking),
    message: 'Bạn không có quyền tạo mới Booking'
  })
  @ResponseMessage('Create a new Booking')
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @GetUser() user: IUser
  ) {
    const newBooking = await this.bookingsService.create(createBookingDto, user);
    return {
      id: newBooking?.id,
      createdAt: newBooking?.createdAt
    }
  }

  @Get()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Read_All, Booking),
    message: 'Bạn không có quyền xem tất cả danh sách Booking'
  })
  @ResponseMessage('Fetch all bookings')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.bookingsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Read, Booking),
    message: 'Bạn không có quyền xem danh sách Booking'
  })
  @ResponseMessage('Fetch booking by id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Booking),
    message: 'Bạn không có quyền cập nhật Booking'
  })
  @ResponseMessage('Update a Booking')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Booking),
    message: 'Bạn không có quyền xóa Booking'
  })
  @ResponseMessage('Delete a Booking')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
