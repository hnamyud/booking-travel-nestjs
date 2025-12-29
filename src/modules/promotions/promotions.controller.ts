import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PoliciesGuard } from 'src/core/guards/policy.guard';
import { ResponseMessage } from 'src/core/decorator/customize.decorator';

@ApiTags('Promotions')
@Controller('promotions')
@UseGuards(PoliciesGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreatePromotionDto })
  @ResponseMessage('Create a new Promotion')
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ResponseMessage('Get all Promotions')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.promotionsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':code')
  @ApiBearerAuth('access-token')
  @ResponseMessage('Get Promotion by ID')
  findOne(@Param('code') code: string) {
    return this.promotionsService.findOne(code);
  }

  @Patch(':id')
  @ApiBody({ type: UpdatePromotionDto })
  @ApiBearerAuth('access-token')
  @ResponseMessage('Update Promotion by ID')
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ResponseMessage('Delete Promotion by ID')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
