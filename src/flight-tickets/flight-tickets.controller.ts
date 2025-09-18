import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlightTicketsService } from './flight-tickets.service';
import { CreateFlightTicketDto } from './dto/create-flight-ticket.dto';
import { UpdateFlightTicketDto } from './dto/update-flight-ticket.dto';

@Controller('flight-tickets')
export class FlightTicketsController {
  constructor(private readonly flightTicketsService: FlightTicketsService) {}

  @Post()
  create(@Body() createFlightTicketDto: CreateFlightTicketDto) {
    return this.flightTicketsService.create(createFlightTicketDto);
  }

  @Get()
  findAll() {
    return this.flightTicketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flightTicketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlightTicketDto: UpdateFlightTicketDto) {
    return this.flightTicketsService.update(+id, updateFlightTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flightTicketsService.remove(+id);
  }
}
