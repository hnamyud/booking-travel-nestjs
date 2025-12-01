import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/common/interfaces/user.interface';
import mongoose, { mongo } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: SoftDeleteModel<PaymentDocument>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, user: IUser) {
    const {
      booking_id,
      provider,
      amount,
      currency,
      status,
      method,
    } = createPaymentDto;
    if(!mongoose.Types.ObjectId.isValid(booking_id.toString())) {
      throw new BadRequestException('Invalid booking_id');
    }
    const newPayment = await this.paymentModel.create({
      booking_id,
      user_id: user._id,
      provider,
      amount,
      currency,
      status,
      method,
    });
    return newPayment;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.paymentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.paymentModel.find(filter)
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
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return `Not found payment`;
    };
    return await this.paymentModel.findOne({
      _id: id
    });
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
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found payment`);
    }
    return this.paymentModel.softDelete({
      _id: id
    });
  }
}
