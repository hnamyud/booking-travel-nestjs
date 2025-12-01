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
  ) { }

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
      reviews
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
      reviews
    });
    return newTour;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
  const { filter, sort } = aqp(qs);

  delete filter.current;
  delete filter.pageSize;
  let offset = (+currentPage - 1) * (+limit);
  let defaultLimit = +limit ? +limit : 10;

  const pipeline: any[] = [];

  // === CUSTOM PARSER: thay $ bằng ký tự khác ===
  // VD: price_min, price_max thay vì price[$gte], price[$lte]
  const customFilter: any = {};

  // Parse price range: price_min=1000000&price_max=5000000
  if (filter.price_min || filter.price_max) {
    customFilter.price = {};
    if (filter.price_min) customFilter.price.$gte = +filter.price_min;
    if (filter.price_max) customFilter.price.$lte = +filter.price_max;
    delete filter.price_min;
    delete filter.price_max;
  }

  // Parse time range: timeStart_from=2025-09-01&timeEnd_to=2025-12-31
  if (filter.timeStart_from) {
    customFilter.timeStart = { $gte: new Date(filter.timeStart_from) };
    delete filter.timeStart_from;
  }
  if (filter.timeEnd_to) {
    customFilter.timeEnd = { $lte: new Date(filter.timeEnd_to) };
    delete filter.timeEnd_to;
  }

  // Parse destination name: destinationName=Paris
  if (filter.destinationName) {
    pipeline.push(
      {
        $lookup: {
          from: 'destinations',
          localField: 'destinations',
          foreignField: '_id',
          as: 'destinationDetails'
        }
      },
      {
        $match: {
          'destinationDetails.name': new RegExp(filter.destinationName, 'i')
        }
      }
    );
    delete filter.destinationName;
  }

  // Merge với filter gốc
  const matchStage = { ...filter, ...customFilter };

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // 3. Count total
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await this.tourModel.aggregate(countPipeline);
  const totalItems = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalItems / defaultLimit);

  // 4. Sort, skip, limit
  if (sort) {
    pipeline.push({ $sort: sort });
  }
  pipeline.push({ $skip: offset }, { $limit: defaultLimit });

  // 5. Populate destinations
  pipeline.push({
    $lookup: {
      from: 'destinations',
      localField: 'destinations',
      foreignField: '_id',
      as: 'destinations'
    }
  });

  const result = await this.tourModel.aggregate(pipeline);

  return {
    meta: {
      current: currentPage,
      pageSize: limit,
      pages: totalPages,
      total: totalItems
    },
    result
  };
}

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found destination`);
    };
    const tour = await this.tourModel.findOne({
      _id: id
    });
    return tour.populate({
      path: 'destinations', select:
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found tour`);
    }
    return this.tourModel.softDelete({
      _id: id
    });
  }
}
