import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { Action } from 'src/enum/action.enum';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { Tour } from './schema/tour.schema';

@Controller('tour')
@UseGuards(PoliciesGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Create, Tour),
    message: 'Bạn không có quyền tạo mới Tour'
  })
  @ResponseMessage('Create a new tour')
  async create(@Body() createTourDto: CreateTourDto) {
    const newTour = await this.tourService.create(createTourDto);
    return {
      id: newTour?._id,
      createdAt: newTour?.createdAt
    }
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch all tour')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.tourService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Fetch a tour by id')
  findOne(@Param('id') id: string) {
    return this.tourService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Tour),
    message: 'Bạn không có quyền cập nhật Tour'
  })
  @ResponseMessage("Update a Tour")
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    const updatedTour = this.tourService.update(id, updateTourDto);
    return updatedTour;
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Tour),
    message: 'Bạn không có quyền xóa Tour'
  })
  @ResponseMessage("Delete a Tour")
  remove(@Param('id') id: string) {
    return this.tourService.remove(id);
  }
}
