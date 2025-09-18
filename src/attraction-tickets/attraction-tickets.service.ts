import { Injectable } from '@nestjs/common';
import { CreateAttractionTicketDto } from './dto/create-attraction-ticket.dto';
import { UpdateAttractionTicketDto } from './dto/update-attraction-ticket.dto';

@Injectable()
export class AttractionTicketsService {
  create(createAttractionTicketDto: CreateAttractionTicketDto) {
    return 'This action adds a new attractionTicket';
  }

  findAll() {
    return `This action returns all attractionTickets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attractionTicket`;
  }

  update(id: number, updateAttractionTicketDto: UpdateAttractionTicketDto) {
    return `This action updates a #${id} attractionTicket`;
  }

  remove(id: number) {
    return `This action removes a #${id} attractionTicket`;
  }
}
