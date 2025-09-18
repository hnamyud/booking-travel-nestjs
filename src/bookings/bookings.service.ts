import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { IUser } from 'src/user/user.interface';
import mongoose, { mongo } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: SoftDeleteModel<BookingDocument>,
  ) {}
  async create(createBookingDto: CreateBookingDto, user: IUser) {
    const {
      tour_id,
      numberOfGuests,
      payment
    } = createBookingDto;

    if (!mongoose.Types.ObjectId.isValid(tour_id.toString())) {
      throw new BadRequestException('Invalid tour_id');
    }

    const now = new Date();
    const newBooking = await this.bookingModel.create({
      tour_id,
      user_id: user._id,
      numberOfGuests,
      bookingDate: now,
      payment,
      status: 'PENDING'
    });
    return newBooking;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.bookingModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.bookingModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select('-password') // Loại trừ password
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
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return `Not found booking`;
    };
    return await this.bookingModel.findOne({
      _id: id
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const { ...updateData } = updateBookingDto;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.bookingModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  async remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found booking`);
    }
    return this.bookingModel.softDelete({
      _id: id
    });
  }
}
