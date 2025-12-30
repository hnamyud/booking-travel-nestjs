import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { DiscountType } from 'src/common/enum/discount-type.enum';
import { max, min } from 'class-validator';
import { Promotion, PromotionDocument } from './schemas/promotion.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { ClientSession, mongo } from 'mongoose';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: SoftDeleteModel<PromotionDocument>
  ) {}

  create = async (createPromotionDto: CreatePromotionDto) => {
    const { code, discountType, discountValue, maxDiscountAmount, minBookingValue, usageLimit, startDate, endDate } = createPromotionDto;
    
    const existingPromotion = await this.promotionModel.findOne({ code });
    if (existingPromotion) throw new BadRequestException(`Mã khuyến mãi '${code}' đã tồn tại`);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (start >= end) throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    if (end < now) throw new BadRequestException('Ngày kết thúc phải là tương lai');
    
    switch (discountType) {
      case DiscountType.Percentage:
        if (discountValue < 1 || discountValue > 100) throw new BadRequestException('Giá trị khuyến mãi theo phần trăm phải lớn hơn 1 và nhỏ hơn hoặc bằng 100');
        if (!maxDiscountAmount || maxDiscountAmount <= 0) throw new BadRequestException('Giá trị khuyến mãi tối đa phải lớn hơn 0');
        break;
      case DiscountType.FixedAmount:
        if (discountValue <= 0) throw new BadRequestException('Giá trị khuyến mãi theo số tiền cố định phải lớn hơn 0');
        if (discountValue > minBookingValue) throw new BadRequestException('Giá trị khuyến mãi tối đa không được lớn hơn giá trị đặt chỗ tối thiểu');
        break;
      default:
        throw new BadRequestException('Loại khuyến mãi không hợp lệ');
    }
    const newPromotion = await this.promotionModel.create({
      code,
      discountType,
      discountValue,
      maxDiscountAmount: discountType === DiscountType.FixedAmount ? discountValue : maxDiscountAmount,
      minBookingValue,
      usageLimit,
      usageCount: 0,
      startDate: start,
      endDate: end,
      isActive: true,
    });
    return {
      code: newPromotion.code,
      discountType: newPromotion.discountType,
      discountValue: newPromotion.discountValue,
      maxDiscountAmount: newPromotion.maxDiscountAmount,
      minBookingValue: newPromotion.minBookingValue,
      usageLimit: newPromotion.usageLimit,
      startDate: newPromotion.startDate,
      endDate: newPromotion.endDate,
      isActive: newPromotion.isActive,
    }
  }

  findAll = async (currentPage: number, limit: number, qs: string) => {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.promotionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.promotionModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .select('-__v')
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

  findOne(code: string) {
    const currentPromotion = this.promotionModel.findOne({ code }).select('-__v').exec();
    if(!currentPromotion) {
      throw new BadRequestException('Promotion not found');
    }
    return currentPromotion;
  }

  update = async (id: string, updatePromotionDto: UpdatePromotionDto) => {
    const currentPromotion = await this.promotionModel.findById(id);
    if(!currentPromotion) {
      throw new BadRequestException('Promotion not found');
    }

    if(currentPromotion.usageCount > 0) {
      if(updatePromotionDto.discountType || updatePromotionDto.discountValue || updatePromotionDto.minBookingValue) {
        throw new BadRequestException('Không thể cập nhật loại khuyến mãi, giá trị khuyến mãi hoặc giá trị đặt chỗ tối thiểu khi đã có người sử dụng');
      }
    }

    // Trùng voucher code
    if(updatePromotionDto.code && updatePromotionDto.code !== currentPromotion.code) {
      const duplicate = await this.promotionModel.findOne({
        code: updatePromotionDto.code.toUpperCase(),
        _id: { $ne: id }
      });
      if(duplicate) throw new BadRequestException(`Mã khuyến mãi '${updatePromotionDto.code}' đã tồn tại`);
    }

    // Merge dữ liệu để Validate logic
    const finalStart = updatePromotionDto.startDate ? new Date(updatePromotionDto.startDate) : updatePromotionDto.startDate;
    const finalEnd = updatePromotionDto.endDate ? new Date(updatePromotionDto.endDate) : updatePromotionDto.endDate;
    const finalType = updatePromotionDto.discountType || updatePromotionDto.discountType;
    const finalValue = updatePromotionDto.discountValue || updatePromotionDto.discountValue;
    const finalMinBooking = updatePromotionDto.minBookingValue || updatePromotionDto.minBookingValue;
    const finalMaxDiscount = updatePromotionDto.maxDiscountAmount || updatePromotionDto.maxDiscountAmount;

    if(finalStart >= finalEnd) throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    if(updatePromotionDto.discountType || updatePromotionDto.discountValue || updatePromotionDto.minBookingValue) {
      if(finalType === DiscountType.Percentage) {
        if(finalValue < 1 || finalValue > 100) throw new BadRequestException('Giá trị khuyến mãi theo phần trăm phải lớn hơn 1 và nhỏ hơn hoặc bằng 100');
        if (!finalMaxDiscount || finalMaxDiscount <= 0) throw new BadRequestException('Giá trị khuyến mãi tối đa phải lớn hơn 0');
      } else {
        if(finalMinBooking < finalValue) throw new BadRequestException('Giá trị khuyến mãi tối đa không được lớn hơn giá trị đặt chỗ tối thiểu'); 
      }
    }

    return await this.promotionModel.findByIdAndUpdate(
      id,
      {
        ...updatePromotionDto,
        code: updatePromotionDto.code ? updatePromotionDto.code.toUpperCase() : undefined,
      },
      { new: true }
    );
  }

  remove = async (id: string) => {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Promotion ID');
    }
    return await this.promotionModel.softDelete({
      _id: id
    });
  }

  updateUsageCount = async (id: string, increment: number, session?: ClientSession) => {
    return await this.promotionModel.findByIdAndUpdate(
      id,
      { $inc: { usageCount: increment } },
      { new: true, session: session }
    );
  }
}
