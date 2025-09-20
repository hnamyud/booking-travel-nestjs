import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FlightTicketsService } from './flight-tickets.service';
import { CreateFlightTicketDto } from './dto/create-flight-ticket.dto';
import { UpdateFlightTicketDto } from './dto/update-flight-ticket.dto';
import { ResponseMessage } from 'src/decorator/customize.decorator';

@Controller('flight-tickets')
export class FlightTicketsController {
  constructor(private readonly flightTicketsService: FlightTicketsService) {}

  @Post()
  @ResponseMessage('Create a flight ticket successfully')
  async create(@Body() createFlightTicketDto: CreateFlightTicketDto) {
    const newFlightTicket = await this.flightTicketsService.create(createFlightTicketDto);
    return {
      id: newFlightTicket?._id,
      createdAt: newFlightTicket?.createdAt,
    };
  }

  @Get()
  @ResponseMessage('Flight tickets retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.flightTicketsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Flight ticket retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.flightTicketsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a flight ticket successfully')
  update(@Param('id') id: string, @Body() updateFlightTicketDto: UpdateFlightTicketDto) {
    return this.flightTicketsService.update(id, updateFlightTicketDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete a flight ticket successfully')
  remove(@Param('id') id: string) {
    return this.flightTicketsService.remove(id);
  }
}
