import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour, TourDocument } from './schema/tour.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class TourService {
  constructor(
    @InjectModel(Tour.name) private tourModel: SoftDeleteModel<TourDocument>,
  ) {}

  // Tự động cập nhật isAvailable khi module được khởi tạo
  async onModuleInit() {
    const now = new Date();
    // Update tất cả tour đã hết hạn
    await this.tourModel.updateMany(
      { timeEnd: { $lt: now } },
      { $set: { isAvailable: false } }
    );
    console.log('Auto update isAvailable for tours completed!');
  }

  async create(createTourDto: CreateTourDto) {
    const { 
      name, 
      description, 
      duration, 
      price, 
      timeStart,
      timeEnd,
      isAvailable, 
      destinations, 
      reviews,
      service_id
    } = createTourDto;

    const newTour = await this.tourModel.create({
      name,
      description,
      duration,
      price,
      timeStart,
      timeEnd,
      isAvailable,
      destinations,
      reviews,
      service_id
    });
    return newTour;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.tourModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.tourModel.find(filter)
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
      throw new BadRequestException(`Not found destination`);
    };
    const tour = await this.tourModel.findOne({
      _id: id
    });
    return tour.populate({ path: 'destinations', select: 
      { name: 1, country: 1, description: 1, images: 1 }
     });
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    const { ...updateData } = updateTourDto;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    
    const result = await this.tourModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found tour`);
    }
    return this.tourModel.softDelete({
      _id: id
    });
  }
}
