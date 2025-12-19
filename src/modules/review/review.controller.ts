import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Public, ResponseMessage, GetUser } from 'src/core/decorator/customize.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { PoliciesGuard } from 'src/core/guards/policy.guard';
import { Action } from 'src/core/abilities/action.enum';
import { Review } from './schema/review.schema';
import { CheckPolicies } from 'src/core/decorator/policy.decorator';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Review')
@Controller('review')
@UseGuards(PoliciesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Create, Review),
    message: 'Bạn không có quyền tạo mới Review'
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateReviewDto })
  @ResponseMessage('Create a new review')
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser() user: IUser
  ) {
    const newReview = await this.reviewService.create(createReviewDto, user);
    return {
      id: newReview?._id,
      createdAt: newReview?.createdAt
    };
  }
  @Get('user')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Read, Review),
    message: 'Bạn không có quyền xem Review'
  })
  @ApiBearerAuth('access-token')
  @ResponseMessage("Fetch a review by user_id")
  findAllByUser(
    @GetUser() user: IUser,
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.reviewService.findReviewByUser(user, +currentPage, +limit, qs);
  }

  @Get()
  @Public()
  @ResponseMessage("Fetch all review")
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.reviewService.findAll(+currentPage, +limit, qs);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Review),
    message: 'Bạn không có quyền cập nhật Review'
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateReviewDto })
  @ResponseMessage("Update a Review")
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Review),
    message: 'Bạn không có quyền xóa Review'
  })
  @ApiBearerAuth('access-token')
  @ResponseMessage("Delete a Review")
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
