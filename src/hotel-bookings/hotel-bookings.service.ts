import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { HotelBooking, HotelBookingDocument } from './schemas/hotel-booking.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose, { mongo } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class HotelBookingsService {
  constructor(@InjectModel(HotelBooking.name) private hotelBookingModel: SoftDeleteModel<HotelBookingDocument>) {}

  async create(createHotelBookingDto: CreateHotelBookingDto) {
    const {
      service_id,
      hotel_name,
      address,
      room_type,
      check_in_date,
      check_out_date,
      amenities
    } = createHotelBookingDto;

    if(!mongoose.Types.ObjectId.isValid(service_id.toString())) {
      throw new BadRequestException('Invalid service_id');
    }

    const newHotelBooking = await this.hotelBookingModel.create({
      service_id,
      hotel_name,
      address,
      room_type,
      check_in_date,
      check_out_date,
      amenities
    });
    return newHotelBooking;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.hotelBookingModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.hotelBookingModel.find(filter)
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
      return `Not found hotel booking`;
    };
    return await this.hotelBookingModel.findOne({
      _id: id
    });
  }

  async update(id: string, updateHotelBookingDto: UpdateHotelBookingDto) {
    const { ...updateData } = updateHotelBookingDto;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.hotelBookingModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found hotel booking`);
    }
    return this.hotelBookingModel.softDelete({
      _id: id
    });
  }
}
