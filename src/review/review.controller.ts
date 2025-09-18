import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize.decorator';
import { IUser } from 'src/user/user.interface';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ResponseMessage('Create a new review')
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @User() user: IUser
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
  @ResponseMessage("Update a Review")
  update( @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(updateReviewDto);
  }

  @Delete(':id')
  @ResponseMessage("Delete a Review")
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
