import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour, TourDocument } from './schema/tour.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { model } from 'mongoose';
import aqp from 'api-query-params';
import { Destination, DestinationDocument } from '../destination/schema/destination.schema';
import slugify from 'slugify';

@Injectable()
export class TourService {
  constructor(
    @InjectModel(Tour.name) private tourModel: SoftDeleteModel<TourDocument>,
    @InjectModel(Destination.name) private destinationModel: SoftDeleteModel<DestinationDocument>,
  ) { }

  async create(createTourDto: CreateTourDto) {
    const slug = slugify(createTourDto.name, {
      lower: true,      // chữ thường
      strict: true,     // bỏ ký tự đặc biệt
      locale: 'vi'      // hỗ trợ tiếng Việt
    });

    const newTour = await this.tourModel.create({
      ...createTourDto,
      slug: slug,
      // Khi mới tạo, số chỗ còn trống (available) = Tổng số chỗ (total)
      availableSlots: createTourDto.totalSlots,
      // Số người đã đặt bắt đầu bằng 0
      bookedParticipants: 0
    });
    return newTour;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const pipeline: any[] = [];

    // === CUSTOM PARSER: thay $ bằng ký tự khác ===
    // VD: price_min, price_max thay vì price[$gte], price[$lte]
    if (filter.priceMin) {
      filter.price = { ...filter.price, $gte: +filter.priceMin };
      delete filter.priceMin;
    }
    if (filter.priceMax) {
      filter.price = { ...filter.price, $lte: +filter.priceMax };
      delete filter.priceMax;
    }

    // Parse time range: timeStart_from=2025-09-01&timeEnd_to=2025-12-31
    if (filter.timeStart_from && filter.timeEnd_to) {
      const userStart = new Date(filter.timeStart_from);
      const userEnd = new Date(filter.timeEnd_to);

      // Validation cơ bản
      if (userStart > userEnd) throw new BadRequestException('Ngày đi phải nhỏ hơn ngày về');

      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const userWindowMs = userEnd.getTime() - userStart.getTime();

      // Sử dụng $expr để so sánh các field nội tại của Document
      // *** $expr không tận dụng index tốt bằng find thường, nhưng bắt buộc phải dùng ở đây
      filter.$expr = {
        $and: [
          // 1. Check độ dài: Tour phải ngắn hơn thời gian rảnh của khách
          // duration_days (đổi ra ms) <= userWindowMs
          {
            $lte: [
              { $multiply: ["$durationDays", ONE_DAY_MS] },
              userWindowMs
            ]
          },

          // 2. Logic Giao nhau (Overlap Logic)
          // Khoảng Tour: [timeStart, timeEnd]
          // Khoảng Khách (có thể khởi hành): [userStart, userEnd - duration]

          // Điều kiện 1: Tour.End >= User.Start
          // (Nếu Tour kết thúc bán trước khi khách rảnh -> Loại)
          { $gte: ["$timeEnd", userStart] },

          // Điều kiện 2: Tour.Start <= User.End - Duration
          // (Nếu Tour mở bán quá muộn, khách đi không kịp về -> Loại)
          {
            $lte: [
              "$timeStart",
              {
                $subtract: [
                  userEnd,
                  { $multiply: ["$durationDays", ONE_DAY_MS] } // Trừ đi thời gian đi tour
                ]
              }
            ]
          }
        ]
      };
    } else if (filter.timeStart_from) {
      // Logic: Tour.Start <= UserDate <= Tour.End
      const userDate = new Date(filter.timeStart_from);

      // 1. Tour đã mở bán trước đó
      filter.timeStart = { ...filter.timeStart, $lte: userDate };

      // 2. VÀ Tour vẫn còn hạn đến sau đó (Quan trọng!)
      filter.timeEnd = { ...filter.timeEnd, $gte: userDate };
    }
    // Xóa params ảo để không bị query nhầm
    delete filter.timeStart_from;
    delete filter.timeEnd_to;

    // Parse destination name: destinationName=Paris
    if (filter.destinationName) {
      // Tìm tất cả destination có tên chứa từ khóa
      const destinations = await this.destinationModel.find({
        name: new RegExp(filter.destinationName, 'i')
      }).select('_id'); // Chỉ lấy _id cho nhẹ

      const destinationIds = destinations.map(d => d._id);

      // Thêm điều kiện: Tour phải chứa 1 trong các ID này
      // destinations trong Tour là mảng ID -> dùng $in
      filter.destinations = { $in: destinationIds };

      delete filter.destinationName;
    }

    // Đảm bảo không lấy bản ghi đã xóa
    filter.isDeleted = { $ne: true };

    const totalItems = await this.tourModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Query dữ liệu
    // sort từ aqp trả về dạng { price: 1 } hoặc { price: -1 } -> Mongoose hiểu luôn
    const result = await this.tourModel.find(filter)
      .select('-__v -isDeleted') // Bỏ bớt rác
      .sort(sort as any)
      .skip(offset)
      .limit(defaultLimit)
      .populate('destinations') // Populate bình thường, hiệu năng tốt hơn tự lookup
      .exec();

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

  async findOne(slug: string) {
    const tour = await this.tourModel.findOne({ slug: slug })
      .populate('destinations') // Populate địa điểm (như cũ)

      // Dùng cái virtual vừa định nghĩa
      .populate({
        path: 'reviews',
        options: {
          sort: { rating: -1 },
          limit: 5
        },
        select: 'rating comment user_id createdAt', // Chỉ lấy những thông tin này
        populate: {
          path: 'user_id',
          model: 'User',
          select: 'name email'
        }
      })
      .exec();
    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour;
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    // 1. Nếu Admin có sửa totalSlots, phải check logic
    if (updateTourDto.totalSlots) {
      const currentTour = await this.tourModel.findById(id);

      // Không cho phép giảm tổng chỗ xuống thấp hơn số người đã đặt
      if (updateTourDto.totalSlots < currentTour.bookedParticipants) {
        throw new BadRequestException(
          `Cannot reduce total slots to ${updateTourDto.totalSlots} because there are already ${currentTour.bookedParticipants} participants booked!`
        );
      }

      // Tự động tính lại availableSlots
      // available = Mới - Đã đặt
      updateTourDto['availableSlots'] = updateTourDto.totalSlots - currentTour.bookedParticipants;
    }

    // 2. Chặn không cho update trực tiếp 2 trường này từ DTO (để đảm bảo tính toàn vẹn)
    delete updateTourDto['bookedParticipants'];
    delete updateTourDto['availableSlots']; // Chỉ được update gián tiếp qua totalSlots

    // 3. Update
    const updatedTour = await this.tourModel.findByIdAndUpdate(
      id,
      updateTourDto,
      { new: true } // Trả về data mới sau khi update
    );

    return updatedTour;
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
