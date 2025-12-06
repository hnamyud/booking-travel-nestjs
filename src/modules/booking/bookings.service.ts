import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { IUser } from 'src/common/interfaces/user.interface';
import mongoose, { mongo } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { Tour, TourDocument } from '../tour/schema/tour.schema';
import { LockService } from 'src/common/services/lock.services';
import { StatusBooking } from 'src/common/enum/status-booking.enum';
import { StatusPayment } from 'src/common/enum/status-payment.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: SoftDeleteModel<BookingDocument>,
    @InjectModel(Tour.name) private tourModel: SoftDeleteModel<TourDocument>,
    private lockService: LockService,
  ) { }
  async create(createBookingDto: CreateBookingDto, user: IUser) {
    const {
      tour_id,
      numberOfGuests,
      contactInfo,
      note
    } = createBookingDto;

    return this.lockService.withLock(`tour_booking_${tour_id}`, async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const tour = await this.tourModel.findById({
          tour_id,
          availableSlots: { $gte: numberOfGuests }
        });

        if (!tour) {
            // Có thể do không tìm thấy tour, hoặc do hết vé
            // Check lại kỹ hơn để báo lỗi chính xác
            const existingTour = await this.tourModel.findById(tour_id).session(session);
            if (!existingTour) throw new BadRequestException('Tour not found');
            throw new ConflictException('Not enough slots available');
        }

        const newBooking = await this.bookingModel.create([{
          tour_id,
          user_id: user._id,
          numberOfGuests,
          totalPrice: tour.price * numberOfGuests,
          status: StatusBooking.Pending,
          payment_status: StatusPayment.Pending,
          contactInfo,
          note
        }], { session });

        await this.tourModel.updateOne(
          { _id: tour_id },
          { $inc: { 
            bookedParticipants: numberOfGuests, 
            availableSlots: -numberOfGuests
          } },
          { session }
        );

        await session.commitTransaction();
        return newBooking[0];
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }, 15000);
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found booking`);
    }
    return this.bookingModel.softDelete({
      _id: id
    });
  }

  confirmBooking = async (id: string, payment_id: string) => {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    // TRAP: Khách thanh toán trễ, Booking đã bị Cronjob hủy do hết hạn
    if (booking.status === StatusBooking.Cancelled || booking.status === StatusBooking.Expired) {
       // Ca khó: Tiền đã trừ nhưng vé đã hủy.
       // Logic: Báo lỗi để Admin xử lý hoàn tiền thủ công hoặc tự động refund.
       throw new ConflictException('Booking has been cancelled/expired');
    }

    if (booking.status === StatusBooking.Confirmed) {
      return booking;
    }

    booking.status = StatusBooking.Confirmed;
    booking.payment_status = StatusPayment.Paid;
    booking.payment_id = new mongoose.Types.ObjectId(payment_id) as any;
    booking.confirmAt = new Date();
    await booking.save();
    return booking;
  }
}
