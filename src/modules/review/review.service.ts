import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { IUser } from 'src/common/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from './schema/review.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
import { StatusBooking } from 'src/common/enum/status-booking.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: SoftDeleteModel<ReviewDocument>,
    @InjectModel(Booking.name) private bookingModel: SoftDeleteModel<BookingDocument>,
  ) { }
  async create(createReviewDto: CreateReviewDto, user: IUser) {
    const { tour_id, rating, comment } = createReviewDto;

    const completedBookings = await this.bookingModel.find({
      user_id: user._id,
      tour_id: tour_id,
      status: StatusBooking.Completed
    }).sort({ createdAt: -1 }); // Lấy booking gần nhất

    if (!completedBookings || completedBookings.length === 0) {
      throw new NotFoundException('Bạn chưa từng đi tour này hoặc chuyến đi chưa hoàn thành.');
    }

    let targetBooking = null;

    for (const booking of completedBookings) {
      const hasReview = await this.reviewModel.exists({ booking_id: booking._id });
      if (!hasReview) {
        targetBooking = booking;
        break;
      }
    }

    if (!targetBooking) {
      throw new BadRequestException('Bạn đã đánh giá tất cả các chuyến đi cho tour này rồi.');
    }

    const newReview = await this.reviewModel.create({
      user_id: user._id,
      tour_id,
      booking_id: targetBooking._id, // Auto-bind vào booking chưa review
      rating,
      comment
    });

    // TODO: Tính toán lại Rating trung bình cho Tour (Side effect)

    return newReview;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.reviewModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.reviewModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found review`);
    };
    return await this.reviewModel.findOne({
      _id: id
    });
  }

  async update(updateReviewDto: UpdateReviewDto) {
    const { _id, ...updateData } = updateReviewDto;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.reviewModel.updateOne(
      { _id: _id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found review`);
    }
    return this.reviewModel.softDelete({
      _id: id
    });
  }
}
