import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Public, ResponseMessage, GetUser } from 'src/decorator/customize.decorator';
import { IUser } from 'src/user/user.interface';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { Action } from 'src/enum/action.enum';
import { Review } from './schema/review.schema';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { ApiBearerAuth, ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';

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

  @Get(':id')
  @Public()
  @ResponseMessage("Fetch a review by id")
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch()
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Review),
    message: 'Bạn không có quyền cập nhật Review'
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateReviewDto })
  @ResponseMessage("Update a Review")
  update( @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(updateReviewDto);
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
