import { Injectable } from '@nestjs/common';
import { CreateFlightTicketDto } from './dto/create-flight-ticket.dto';
import { UpdateFlightTicketDto } from './dto/update-flight-ticket.dto';

@Injectable()
export class FlightTicketsService {
  create(createFlightTicketDto: CreateFlightTicketDto) {
    return 'This action adds a new flightTicket';
  }

  findAll() {
    return `This action returns all flightTickets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flightTicket`;
  }

  update(id: number, updateFlightTicketDto: UpdateFlightTicketDto) {
    return `This action updates a #${id} flightTicket`;
  }

  remove(id: number) {
    return `This action removes a #${id} flightTicket`;
  }
}
