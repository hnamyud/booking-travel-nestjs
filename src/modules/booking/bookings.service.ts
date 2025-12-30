import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { IUser } from 'src/common/interfaces/user.interface';
import mongoose, { Connection } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { Tour, TourDocument } from '../tour/schema/tour.schema';
import { LockService } from 'src/common/services/lock.services';
import { StatusBooking } from 'src/common/enum/status-booking.enum';
import { StatusPayment } from 'src/common/enum/status-payment.enum';
import * as crypto from 'crypto';
import { MailService } from 'src/shared/mailer/mail.service';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schema';
import { VerifyTicketDto } from './dto/verify-ticket.dto';
import { Promotion, PromotionDocument } from '../promotions/schemas/promotion.schema';
import { DiscountType } from 'src/common/enum/discount-type.enum';
import { PromotionsService } from '../promotions/promotions.service';
import { session } from 'passport';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: SoftDeleteModel<BookingDocument>,
    @InjectModel(Tour.name) private tourModel: SoftDeleteModel<TourDocument>,
    @InjectModel(Payment.name) private paymentModel: SoftDeleteModel<PaymentDocument>,
    @InjectModel(Promotion.name) private promotionModel: SoftDeleteModel<PromotionDocument>,
    @InjectConnection() private readonly connection: Connection,
    private mailService: MailService,
    private lockService: LockService,
    private promotionService: PromotionsService,
  ) { }
  async create(createBookingDto: CreateBookingDto, user: IUser) {
    const {
      tour_id,
      numberOfGuests,
      contactInfo,
      code,
      note,
      startDate
    } = createBookingDto;

    return this.lockService.withLock(`tour_booking_${tour_id}`, async () => {
      const session = await this.connection.startSession();
      session.startTransaction();

      try {
        const tour = await this.tourModel.findById(tour_id).session(session);

        if (!tour) {
          throw new BadRequestException('Tour not found');
        }

        if (!tour.isAvailable) {
          throw new ConflictException('Tour is not available for booking');
        }

        // Check availableSlots riêng
        if (tour.availableSlots < numberOfGuests) {
          throw new ConflictException('Not enough slots available');
        }

        const timeStart = new Date(startDate);
        const timeEnd = new Date(startDate);
        timeEnd.setDate(timeStart.getDate() + tour.durationDays);
        let totalPrice = tour.price * numberOfGuests;
        let originalPrice = totalPrice;
        let discountAmount = 0;
        let finalPrice = totalPrice;
        let promotionId = null;

        if (code) {
          const promotion = await this.promotionModel.findOne({ code }).session(session);
          if (!promotion) throw new NotFoundException('Mã khuyến mãi không tồn tại');
          const now = new Date();
          if (!promotion.isActive) throw new BadRequestException('Khuyến mãi không còn hoạt động');
          if (promotion.startDate > now || promotion.endDate < now) throw new BadRequestException('Khuyến mãi chưa trong thời gian áp dụng');
          if (promotion.usageLimit <= promotion.usageCount) throw new BadRequestException('Khuyến mãi đã đạt giới hạn sử dụng');
          if (promotion.minBookingValue > totalPrice) throw new BadRequestException('Giá trị đơn hàng không đủ để áp dụng khuyến mãi');

          switch (promotion.discountType) {
            case DiscountType.Percentage:
              discountAmount = totalPrice * (promotion.discountValue / 100);
              if (discountAmount > promotion.maxDiscountAmount) {
                discountAmount = promotion.maxDiscountAmount;
              }
              break;
            case DiscountType.FixedAmount:
              discountAmount = promotion.discountValue;
              break;
            default:
              throw new BadRequestException('Loại khuyến mãi không hợp lệ');
          }

          finalPrice = totalPrice - discountAmount;
          if (finalPrice < 0) finalPrice = 0;
          promotionId = promotion._id;

          await this.promotionService.updateUsageCount(
            promotion._id.toString(),
            1,
            session
          );
        }

        const newBooking = await this.bookingModel.create([{
          tour_id,
          user_id: user._id,
          numberOfGuests,
          totalPrice: finalPrice,
          originalPrice: originalPrice,
          discountAmount: discountAmount,
          promotion_id: promotionId,
          status: StatusBooking.Pending,
          payment_status: StatusPayment.Pending,
          contactInfo,
          note,
          startDate: timeStart,
          endDate: timeEnd
        }], { session });

        await this.tourModel.updateOne(
          { _id: tour_id },
          {
            $inc: {
              bookedParticipants: numberOfGuests,
              availableSlots: -numberOfGuests
            }
          },
          { session }
        );

        await session.commitTransaction();
        return newBooking[0];
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        throw error;
      } finally {
        await session.endSession();
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
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    // VALIDATE TRẠNG THÁI (STATE MACHINE)
    if (updateBookingDto.status && updateBookingDto.status !== booking.status) {
      this.validateStatusTransition(booking.status, updateBookingDto.status);

      // XỬ LÝ SIDE EFFECT (QUAN TRỌNG)
      await this.handleSideEffects(booking, updateBookingDto.status);
    }

    // Update các field khác (contactInfo, note...)
    Object.assign(booking, updateBookingDto);
    return booking.save();
  }

  // Helper chức năng kiểm tra chuyển trạng thái hợp lệ
  private validateStatusTransition(oldStatus: StatusBooking, newStatus: StatusBooking) {
    const validTransitions = {
      [StatusBooking.Pending]: [StatusBooking.Confirmed, StatusBooking.Cancelled],
      [StatusBooking.Confirmed]: [StatusBooking.Completed, StatusBooking.Cancelled],
      // Các trạng thái còn lại là "Ngõ cụt", mảng rỗng []
      [StatusBooking.Cancelled]: [],
      [StatusBooking.Expired]: [],
      [StatusBooking.Failed]: [],
      [StatusBooking.Completed]: [],
    };

    const allowed = validTransitions[oldStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${oldStatus} sang ${newStatus}`
      );
    }
  }

  // Helper chức năng xử lý các tác động phụ khi đổi trạng thái
  private async handleSideEffects(booking: BookingDocument, newStatus: StatusBooking) {
    // PENDING/CONFIRMED -> CANCELLED (Khách hủy hoặc Admin hủy)
    // => Phải TRẢ LẠI KHO (vì lúc create mình đã trừ rồi)
    if (newStatus === StatusBooking.Cancelled) {
      await this.tourModel.updateOne(
        { _id: booking.tour_id },
        { $inc: { availableSlots: booking.numberOfGuests, bookedParticipants: -booking.numberOfGuests } }
      );
    }
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found booking`);
    }
    const booking = await this.bookingModel.findById(id);
    const holdingSlotStatuses = [StatusBooking.Pending, StatusBooking.Confirmed];

    if (holdingSlotStatuses.includes(booking.status)) {
      await this.tourModel.updateOne(
        { _id: booking.tour_id },
        {
          $inc: {
            availableSlots: booking.numberOfGuests,
            bookedParticipants: -booking.numberOfGuests
          }
        }
      );
    }
    return this.bookingModel.softDelete({
      _id: id
    });
  }

  confirmBooking = async (id: string, payment_id: string) => {
    const booking = await this.bookingModel.findById(id).populate('tour_id');

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const ticketCode = `TICKET-${Date.now()
      .toString()
      .slice(-4)}-${crypto.randomBytes(2)
        .toString('hex')
        .toUpperCase()}`;

    // TRAP: Khách thanh toán trễ, Booking đã bị Cronjob hủy do hết hạn
    if (booking.status === StatusBooking.Cancelled || booking.status === StatusBooking.Expired) {
      // Ca khó: Tiền đã trừ nhưng vé đã hủy.
      // Logic: Báo lỗi để Admin xử lý hoàn tiền thủ công hoặc tự động refund.
      throw new ConflictException('Booking has been cancelled/expired');
    }

    if (booking.status === StatusBooking.Confirmed) {
      return booking;
    }

    const payment = await this.paymentModel.findById(payment_id);
    if (!payment) throw new NotFoundException('Payment info not found');
    const tourData = booking.tour_id as any;

    booking.status = StatusBooking.Confirmed;
    booking.payment_status = StatusPayment.Success;
    booking.confirmAt = new Date();
    booking.ticketCode = ticketCode;
    await booking.save();

    await this.mailService.sendConfirmationEmail(
      booking.contactInfo.email,
      booking.contactInfo.fullName,
      ticketCode,
      tourData.name,
      new Date(booking.startDate),
      booking.numberOfGuests,
      payment.provider,
      booking.totalPrice
    ).catch(err => {
      console.error('Lỗi gửi mail vé:', err);
    });

    return booking;
  }

  cancelBooking = async (id: string) => {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const booking = await this.bookingModel.findById(id);
      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      const terminalStatuses = [
        StatusBooking.Cancelled,
        StatusBooking.Expired,
        StatusBooking.Failed
      ];
      if (terminalStatuses.includes(booking.status)) {
        throw new BadRequestException(`Booking đã ở trạng thái ${booking.status}, không thể hủy tiếp.`);
      }
      if (booking.status === StatusBooking.Completed) {
        throw new BadRequestException('Đơn đã hoàn thành, không thể hủy ngang. Vui lòng dùng chức năng Hoàn tiền.');
      }

      booking.status = StatusBooking.Cancelled;
      booking.payment_status = StatusPayment.Failed;
      booking.updatedAt = new Date();
      await booking.save({ session });

      // Logic: Cập nhật lại số lượng vé trong Tour
      await this.tourModel.updateOne(
        { _id: booking.tour_id },
        {
          $inc: {
            availableSlots: booking.numberOfGuests,
            bookedParticipants: -booking.numberOfGuests
          }
        }
      );

      if (booking.promotion_id) {
        await this.promotionService.updateUsageCount(
          booking.promotion_id.toString(),
          -1,
          session
        );
      }

      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

  }

  verifyTicket = async (verifyTicketDto: VerifyTicketDto) => {
    const booking = await this.bookingModel.findOne({ ticketCode: verifyTicketDto.ticketCode });
    if (!booking) throw new NotFoundException('Vé không tồn tại');
    if (booking.status !== StatusBooking.Confirmed) throw new BadRequestException('Vé chưa thanh toán hoặc đã hủy');
    if (booking.isUsed) throw new BadRequestException('Vé đã được sử dụng');

    booking.isUsed = true;
    booking.checkinAt = new Date();
    await booking.save();

    return {
      valid: true,
      message: 'Xác thực thành công!'
    };
  }
}
