import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Public, ResponseMessage } from 'src/decorator/customize.decorator';

@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
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

  @Patch()
  @ResponseMessage("Update a Tour")
  update(@Body() updateTourDto: UpdateTourDto) {
    const updatedTour = this.tourService.update(updateTourDto);
    return updatedTour;
  }

  @Delete(':id')
  @ResponseMessage("Delete a Tour")
  remove(@Param('id') id: string) {
    return this.tourService.remove(id);
  }
}
