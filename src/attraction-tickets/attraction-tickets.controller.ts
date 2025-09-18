import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttractionTicketsService } from './attraction-tickets.service';
import { CreateAttractionTicketDto } from './dto/create-attraction-ticket.dto';
import { UpdateAttractionTicketDto } from './dto/update-attraction-ticket.dto';

@Controller('attraction-tickets')
export class AttractionTicketsController {
  constructor(private readonly attractionTicketsService: AttractionTicketsService) {}

  @Post()
  create(@Body() createAttractionTicketDto: CreateAttractionTicketDto) {
    return this.attractionTicketsService.create(createAttractionTicketDto);
  }

  @Get()
  findAll() {
    return this.attractionTicketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attractionTicketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttractionTicketDto: UpdateAttractionTicketDto) {
    return this.attractionTicketsService.update(+id, updateAttractionTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attractionTicketsService.remove(+id);
  }
}
