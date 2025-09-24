import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttractionTicketsService } from './attraction-tickets.service';
import { CreateAttractionTicketDto } from './dto/create-attraction-ticket.dto';
import { UpdateAttractionTicketDto } from './dto/update-attraction-ticket.dto';
import { ResponseMessage } from 'src/decorator/customize.decorator';

@Controller('attraction-tickets')
export class AttractionTicketsController {
  constructor(private readonly attractionTicketsService: AttractionTicketsService) {}

  @Post()
  @ResponseMessage('Create an attraction ticket successfully')
  async create(@Body() createAttractionTicketDto: CreateAttractionTicketDto) {
    const newAttractionTicket = await this.attractionTicketsService.create(createAttractionTicketDto);
    return {
      id: newAttractionTicket?._id,
      createdAt: newAttractionTicket?.createdAt,
    };
  }

  @Get()
  @ResponseMessage('Attraction tickets retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.attractionTicketsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Attraction ticket retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.attractionTicketsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update an attraction ticket successfully')
  update(@Param('id') id: string, @Body() updateAttractionTicketDto: UpdateAttractionTicketDto) {
    return this.attractionTicketsService.update(id, updateAttractionTicketDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete an attraction ticket successfully')
  remove(@Param('id') id: string) {
    return this.attractionTicketsService.remove(id);
  }
}
