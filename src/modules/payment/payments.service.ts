import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/common/interfaces/user.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import * as crypto from 'crypto';
import { StatusPayment } from 'src/common/enum/status-payment.enum';
import { VnpayService } from '../vnpay/vnpay.service';
import { ProductCode } from 'vnpay';
import { ConfigService } from '@nestjs/config';
import { BookingsService } from '../booking/bookings.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: SoftDeleteModel<PaymentDocument>,
    private readonly vnpayService: VnpayService, // Inject VnpayService
    private readonly configService: ConfigService,
    private readonly bookingService: BookingsService,
  ) { }

  async create(createPaymentDto: CreatePaymentDto, user: IUser, ipAddress?: string) {
    const {
      booking_id,
      provider,
      amount,
      currency,
      metadata
    } = createPaymentDto;
    const uniqueCode = `PAY_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    if (!mongoose.Types.ObjectId.isValid(booking_id.toString())) {
      throw new BadRequestException('Invalid booking_id');
    }
    const newPayment = await this.paymentModel.create({
      code: uniqueCode,
      booking_id,
      user_id: user._id,
      provider,
      amount,
      currency: currency || 'VND',
      status: StatusPayment.Pending,
      metadata
    });

    let paymentUrl = '';

    switch (provider) {
      case 'VNPAY':
        // Thực hiện các thao tác liên quan đến VNPAY
        paymentUrl = this.vnpayService.buildPaymentUrl({
          vnp_Amount: amount,
          vnp_IpAddr: ipAddress || '127.0.0.1',
          vnp_TxnRef: uniqueCode,
          vnp_OrderInfo: `Thanh toan booking ${booking_id}`,
          vnp_OrderType: ProductCode.Other,
          vnp_ReturnUrl: this.configService.get<string>('VNPAY_RETURN_URL'),
        });
        break;
      case 'STRIPE':
        // Logic Stripe...
        break;
    }
    return {
      ...newPayment.toObject(), // Convert mongoose doc sang object thường
      paymentUrl, // Trả về URL cho FE redirect
    };
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.paymentModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.paymentModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .select('-__v -metadata')
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
      throw new BadRequestException('Invalid Payment ID');
    };
    const payment = await this.paymentModel.findById(id)
      .select('-__v') // Chi tiết thì giữ metadata, nhưng vẫn bỏ __v
      .populate('user_id', 'name email phone') // Chỉ lấy field cần thiết của User (Tránh lộ password/balance)
      .populate('booking_id', 'code status') // Chỉ lấy code booking
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const { ...updateData } = updatePaymentDto;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.paymentModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found payment`);
    }
    return this.paymentModel.softDelete({
      _id: id
    });
  }

  handleVnpayIpn = async (query: any) => {
    try {
      const verify = this.vnpayService.verifyIpnCall(query);
      if (!verify.isSuccess) {
        return {
          RspCode: '97',
          Message: 'Invalid signature',
        };
      }

      const {
        vnp_TxnRef,
        vnp_Amount,
        vnp_ResponseCode,
        vnp_TransactionNo,
        vnp_BankCode,
        vnp_PayDate,
        vnp_OrderInfo
      } = query;

      const payment = await this.paymentModel.findOne({ code: vnp_TxnRef });
      if (!payment) {
        return {
          RspCode: '01',
          Message: 'Order not found',
        };
      }
      if (payment.status !== StatusPayment.Pending) {
        return {
          RspCode: '02',
          Message: 'Order already confirmed',
        };
      }

      const inputAmount = Number(vnp_Amount);
      const dbAmount = payment.amount * 100;

      if (dbAmount !== inputAmount) {
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      let newStatus: StatusPayment;

      if (vnp_ResponseCode === '00') {
        // Giao dịch thành công
        newStatus = StatusPayment.Success;
      } else {
        // Giao dịch thất bại
        newStatus = StatusPayment.Failed;
      }

      await this.paymentModel.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: newStatus,
            metadata: {
              ...payment.metadata,
              vnp_TransactionNo,
              vnp_BankCode,
              vnp_PayDate,
              vnp_ResponseCode,
              vnp_OrderInfo,
              ipn_received_at: new Date(),
            },
          },
        }
      );

      // Cập nhật trạng thái booking nếu thanh toán thành công
      if (newStatus === StatusPayment.Success) {
        try {
          await this.bookingService.confirmBooking(payment.booking_id.toString(), payment._id.toString());
        } catch (bookingError) {
          console.error('Error confirming booking:', bookingError);
        }
      }

      // 9. Trả về response cho VNPay
      return {
        RspCode: '00',
        Message: 'Confirm Success',
      };

    } catch (error) {
      console.error('VNPay IPN Error:', error);
      return {
        RspCode: '99',
        Message: 'Unknown error',
      };
    }
  }

  handleVnpayReturn = async (query: any) => {
    const verify = this.vnpayService.verifyReturnUrl(query);
    if (!verify.isSuccess) {
      throw new BadRequestException('Invalid signature');
    }
    const { vnp_TxnRef, vnp_ResponseCode } = query;
    const payment = await this.paymentModel.findOne({ code: vnp_TxnRef });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    let message = 'Giao dịch thất bại';
    let isSuccess = false;

    if (vnp_ResponseCode === '00') {
      isSuccess = true;
      message = 'Giao dịch thành công';
    } else if (vnp_ResponseCode === '24') {
      message = 'Giao dịch bị hủy bởi khách hàng';
    } else {
      message = 'Giao dịch thất bại (Lỗi ngân hàng hoặc thẻ)';
    }

    return {
      isSuccess,      // Frontend dựa vào biến này để hiện Icon (Tick xanh / Chéo đỏ)
      message,        // Frontend hiện dòng này lên màn hình
      payment,        // Trả kèm payment để lấy info (mã đơn, số tiền...)
      vnp_ResponseCode // Trả kèm mã gốc nếu Frontend muốn debug
    };
  }
}
