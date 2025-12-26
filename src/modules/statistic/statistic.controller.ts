import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from 'src/core/guards/policy.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { StatisticService } from "./statistic.service";
import { GetRevenueStatsDto } from "./dto/get-revenue-stats";
import { ResponseMessage } from "src/core/decorator/customize.decorator";

@ApiTags('Statistic')
@Controller('statistic')
@UseGuards(PoliciesGuard)
export class StatisticController {
    constructor(private readonly statisticService: StatisticService) { }

    @Get('revenue')
    @ApiBearerAuth('access-token')
    @ResponseMessage("Get revenue statistics")
    async getRevenueStatistics(
        @Query() dto: GetRevenueStatsDto,
    ) {
        return this.statisticService.getRevenueStats(dto);
    }

    @Get('top-tours')
    @ApiBearerAuth('access-token')
    @ResponseMessage("Get top booked tours")
    async getTopTours(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
    ) {
        return this.statisticService.getTopBookedTours(limit);
    }
}