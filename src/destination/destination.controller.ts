import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors, Query, UseGuards } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { Action } from 'src/enum/action.enum';
import { Destination } from './schema/destination.schema';
import { CheckPolicies } from 'src/decorator/policy.decorator';

@Controller('destination')
@UseGuards(PoliciesGuard)
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Post()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Create, Destination),
    message: 'Bạn không có quyền tạo mới Destination'
  })
  @ResponseMessage("Create a new Destination")
  async create(
    @Body() createDestinationDto: CreateDestinationDto,
  ) {
    const newDestination = await this.destinationService.create(createDestinationDto);
    return {
      id: newDestination?._id,
      createdAt: newDestination?.createdAt
    };
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch destination with paginate")
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.destinationService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage("Fetch destination by id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinationService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Destination),
    message: 'Bạn không có quyền cập nhật Destination'
  })
  @ResponseMessage("Update a Destination")
  update(@Param('id') id: string, @Body() updateDestinationDto: UpdateDestinationDto) {
    const updatedDestination = this.destinationService.update(id, updateDestinationDto);
    return updatedDestination;
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Destination),
    message: 'Bạn không có quyền xóa Destination'
  })
  @ResponseMessage("Delete a Destination")
  remove(@Param('id') id: string) {
    return this.destinationService.remove(id);
  }
}
