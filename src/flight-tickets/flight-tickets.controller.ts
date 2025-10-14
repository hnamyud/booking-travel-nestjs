import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FlightTicketsService } from './flight-tickets.service';
import { CreateFlightTicketDto } from './dto/create-flight-ticket.dto';
import { UpdateFlightTicketDto } from './dto/update-flight-ticket.dto';
import { Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { Action } from 'src/enum/action.enum';
import { FlightTicket } from './schemas/flight-ticket.schema';

@Controller('flight-tickets')
@UseGuards(PoliciesGuard)
export class FlightTicketsController {
  constructor(private readonly flightTicketsService: FlightTicketsService) {}

  @Post()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Create, FlightTicket),
    message: 'Bạn không có quyền tạo mới Flight Ticket'
  })
  @ResponseMessage('Create a flight ticket successfully')
  async create(@Body() createFlightTicketDto: CreateFlightTicketDto) {
    const newFlightTicket = await this.flightTicketsService.create(createFlightTicketDto);
    return {
      id: newFlightTicket?._id,
      createdAt: newFlightTicket?.createdAt,
    };
  }

  @Get()
  @Public()
  @ResponseMessage('Flight tickets retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.flightTicketsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Flight ticket retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.flightTicketsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, FlightTicket),
    message: 'Bạn không có quyền cập nhật Flight Ticket'
  })
  @ResponseMessage('Update a flight ticket successfully')
  update(@Param('id') id: string, @Body() updateFlightTicketDto: UpdateFlightTicketDto) {
    return this.flightTicketsService.update(id, updateFlightTicketDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, FlightTicket),
    message: 'Bạn không có quyền xóa Flight Ticket'
  })
  @ResponseMessage('Delete a flight ticket successfully')
  remove(@Param('id') id: string) {
    return this.flightTicketsService.remove(id);
  }
}
