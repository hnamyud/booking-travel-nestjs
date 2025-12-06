import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ResponseMessage, GetUser } from 'src/core/decorator/customize.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { PoliciesGuard } from 'src/core/guards/policy.guard';
import { CheckPolicies } from 'src/core/decorator/policy.decorator';
import { Action } from 'src/common/enum/action.enum';
import { Booking } from './schemas/booking.schema';
import { ApiBearerAuth, ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(PoliciesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Create, Booking),
    message: 'Bạn không có quyền tạo mới Booking'
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateBookingDto })
  @ResponseMessage('Create a new Booking')
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: Request & { user: any }
  ) {
    const newBooking = await this.bookingsService.create(createBookingDto, req.user);
    return {
      id: newBooking?.id,
      createdAt: newBooking?.createdAt
    }
  }

  @Get()
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateBookingDto })
  @ResponseMessage('Update a Booking')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Booking),
    message: 'Bạn không có quyền xóa Booking'
  })
  @ApiBearerAuth('access-token')
  @ResponseMessage('Delete a Booking')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
