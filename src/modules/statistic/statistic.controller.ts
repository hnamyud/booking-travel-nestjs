import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from 'src/core/guards/policy.guard';
import { Controller, Get, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { StatisticService } from "./statistic.service";
import { ResponseMessage } from "src/core/decorator/customize.decorator";
import { CheckPolicies } from 'src/core/decorator/policy.decorator';
import { Action } from "src/core/abilities/action.enum";

@ApiTags('Statistic')
@Controller('statistic')
@UseGuards(PoliciesGuard)
export class StatisticController {
    constructor(private readonly statisticService: StatisticService) { }

    @Get('top-tours')
    @CheckPolicies({
        handle: (ability) => ability.can(Action.Read, 'Statistic'),
        message: "You do not have permission to view statistics"
    })
    @ApiBearerAuth('access-token')
    @ResponseMessage("Get top booked tours")
    async getTopTours(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
    ) {
        return this.statisticService.getTopBookedTours(limit);
    }

    @Get('overview') // Cho thẻ tổng quan
    @CheckPolicies({
        handle: (ability) => ability.can(Action.Read, 'Statistic'),
        message: "You do not have permission to view statistics"
    })
    @ApiBearerAuth('access-token')
    @ResponseMessage("Get overview statistics")
    getOverview() {
        return this.statisticService.getOverviewStats();
    }

    @Get('chart') // Cho biểu đồ
    @CheckPolicies({
        handle: (ability) => ability.can(Action.Read, 'Statistic'),
        message: "You do not have permission to view statistics"
    })
    @ApiBearerAuth('access-token')
    @ResponseMessage("Get revenue chart data")
    getChart() {
        return this.statisticService.getRevenueChart();
    }
}