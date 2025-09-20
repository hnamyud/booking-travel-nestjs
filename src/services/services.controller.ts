import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ResponseMessage } from 'src/decorator/customize.decorator';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ResponseMessage('Create a service successfully')
  async create(@Body() createServiceDto: CreateServiceDto) {
    const newService = await this.servicesService.create(createServiceDto);
    return {
      id: newService?._id,
      createdAt: newService?.createdAt,
    }
  }

  @Get()
  @ResponseMessage('Services retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.servicesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Service retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a service successfully')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete a service successfully')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
