import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { Action } from 'src/enum/action.enum';
import { Service } from './schemas/service.schema';

@Controller('services')
@UseGuards(PoliciesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Create, Service),
    message: 'Bạn không có quyền tạo mới Service'
  })
  @ResponseMessage('Create a service successfully')
  async create(@Body() createServiceDto: CreateServiceDto) {
    const newService = await this.servicesService.create(createServiceDto);
    return {
      id: newService?._id,
      createdAt: newService?.createdAt,
    }
  }

  @Get()
  @Public()
  @ResponseMessage('Services retrieved successfully')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.servicesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Service retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Service),
    message: 'Bạn không có quyền cập nhật Service'
  })
  @ResponseMessage('Update a service successfully')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Service),
    message: 'Bạn không có quyền xóa Service'
  })
  @ResponseMessage('Delete a service successfully')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}


