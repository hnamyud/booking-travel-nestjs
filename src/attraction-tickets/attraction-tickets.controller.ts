import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AttractionTicketsService } from './attraction-tickets.service';
import { CreateAttractionTicketDto } from './dto/create-attraction-ticket.dto';
import { UpdateAttractionTicketDto } from './dto/update-attraction-ticket.dto';
import { Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { Action } from 'src/enum/action.enum';
import { AttractionTicket } from './schemas/attraction-ticket.schema';

@Controller('attraction-tickets')
@UseGuards(PoliciesGuard)
export class AttractionTicketsController {
  constructor(private readonly attractionTicketsService: AttractionTicketsService) {}

  @Post()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Create, AttractionTicket),
    message: 'Bạn không có quyền tạo mới Attraction Ticket'
  })
  @ResponseMessage('Create an attraction ticket successfully')
  async create(@Body() createAttractionTicketDto: CreateAttractionTicketDto) {
    const newAttractionTicket = await this.attractionTicketsService.create(createAttractionTicketDto);
    return {
      id: newAttractionTicket?._id,
      createdAt: newAttractionTicket?.createdAt,
    };
  }

  @Get()
  @Public()
  @ResponseMessage('Attraction tickets retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.attractionTicketsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Attraction ticket retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.attractionTicketsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Update, AttractionTicket),
    message: 'Bạn không có quyền cập nhật Attraction Ticket'
  })
  @ResponseMessage('Update an attraction ticket successfully')
  update(@Param('id') id: string, @Body() updateAttractionTicketDto: UpdateAttractionTicketDto) {
    return this.attractionTicketsService.update(id, updateAttractionTicketDto);
  }

  @Delete(':id')
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Delete, AttractionTicket),
    message: 'Bạn không có quyền xóa Attraction Ticket'
  })
  @ResponseMessage('Delete an attraction ticket successfully')
  remove(@Param('id') id: string) {
    return this.attractionTicketsService.remove(id);
  }
}
