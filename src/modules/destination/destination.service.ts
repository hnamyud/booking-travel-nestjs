import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Destination, DestinationDocument } from './schema/destination.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { CloudinaryService } from 'src/shared/upload/cloudinary.service';
import { Tour, TourDocument } from '../tour/schema/tour.schema';
import Redis from 'ioredis';

@Injectable()
export class DestinationService {
  constructor(
    @InjectModel(Destination.name) private destinationModel: SoftDeleteModel<DestinationDocument>,
    @InjectModel(Tour.name) private tourModel: SoftDeleteModel<TourDocument>,
    private cloudinaryService: CloudinaryService,
    @Inject('REDIS_CLIENT') private redis: Redis
  ) { }

  async create(createDestinationDto: CreateDestinationDto) {
    const { name, country, description, images } = createDestinationDto;

    // Tạo destination mới với URL và public_id từ Cloudinary
    const newDestination = await this.destinationModel.create({
      name,
      country,
      description,
      images
    });

    return newDestination;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
  
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let page = +currentPage || 1;
    let limitItem = +limit || 10;
    let offset = (page - 1) * limitItem;
    let defaultLimit = +limit ? +limit : 10;

    const isDefaultRequest = page === 1 && !filter.destinationName;
    const cacheKey = `dst_df_lm:${limitItem}`;

    if (isDefaultRequest) {
        // ioredis trả về chuỗi String hoặc null
        const cachedRaw = await this.redis.get(cacheKey);
        
        if (cachedRaw) {
            // Parse từ String sang Object
            return JSON.parse(cachedRaw);
        }
    }

    // Parse destination name: destinationName=keyword (tìm trong name hoặc country)
    if (filter.destinationName) {
        const keyword = filter.destinationName;
        const regex = new RegExp(keyword, 'i'); 
        Object.assign(filter, { $or: [{ name: regex }, { country: regex }] });
        delete filter.destinationName;
    }

    filter.isDeleted = { $ne: true };

    const [totalItems, result] = await Promise.all([
        this.destinationModel.countDocuments(filter),
        this.destinationModel.find(filter)
            .select('-__v -isDeleted')
            .sort(sort as any)
            .skip(offset)
            .limit(limitItem)
            .populate(population)
            .lean() // Bắt buộc dùng lean() để object nhẹ, dễ stringify
            .exec()
    ]);

    const totalPages = Math.ceil(totalItems / limitItem);
    
    const finalResponse = {
      meta: {
        current: page,
        pageSize: limitItem,
        pages: totalPages,
        total: totalItems
      },
      result
    };

    // --- 3. LOGIC SET CACHE (Native Redis) ---
    if (isDefaultRequest) {
        // [QUAN TRỌNG]
        // 1. Phải Stringify object
        // 2. Dùng 'EX' để set thời gian hết hạn (tính bằng GIÂY)
        // 300 giây = 5 phút
        await this.redis.set(cacheKey, JSON.stringify(finalResponse), 'EX', 3600);
    }

    return finalResponse;
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    };
    const cacheKey = `dst_dt:${id}`;
    const catchRaw = await this.redis.get(cacheKey);
    if(catchRaw) return JSON.parse(catchRaw);
    const destination = await this.destinationModel.findById(id)
      .populate({
        path: 'topTours',
        select: 'name slug duration price availableSlots ratingAverage',
      })
      .lean();
    if (!destination) throw new NotFoundException('Destination not found');

    await this.redis.set(cacheKey, JSON.stringify(destination), 'EX', 300); // 10 minutes

    return destination;
  }

  async update(id: string, updateDestinationDto: UpdateDestinationDto) {
    const { ...updateData } = updateDestinationDto;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.destinationModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found destination`);
    }

    const destination = await this.destinationModel.findById(id);

    if (!destination) {
      throw new NotFoundException('Destination không tồn tại');
    }
    if (destination.images && destination.images.length > 0) {
      try {
        const deletePromises = destination.images.map(image =>
          this.cloudinaryService.deleteImage(image.public_id)
        );

        const results = await Promise.allSettled(deletePromises);

        // Log kết quả
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;

        console.log(`✅ Đã xóa ${successCount}/${destination.images.length} ảnh`);

        if (failCount > 0) {
          console.warn(`Không xóa được ${failCount} ảnh`);
        }
      } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
        // Có thể throw error hoặc tiếp tục xóa destination
        // throw new BadRequestException('Không thể xóa ảnh');
      }
    }

    // Soft delete destination
    const result = await this.destinationModel.softDelete({ _id: id });

    return {
      deleted: result.deleted,
      message: 'Xóa destination và ảnh thành công'
    };
  }

  getTopDestinations = async () => {
    const limit = 4;
    const destinations = await this.tourModel.aggregate([
      {
        $match: {
          ratingQuantity: { $gte: 1 },
          isDeleted: { $ne: true },
          isAvailable: true
        }
      },
      {
        $unwind: '$destinations'
      },
      {
        $group: {
          _id: '$destinations',
          avgRating: { $avg: '$ratingAverage' },
          tourCount: { $sum: 1 }
        }
      },
      {
        $sort: { avgRating: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: '_id',
          as: 'destinationInfo'
        }
      },
      {
        $unwind: '$destinationInfo'
      },
      {
        $project: {
          _id: '$destinationInfo._id',
          name: '$destinationInfo.name',
          avgRating: { $round: ['$avgRating', 1] },
          image: { $arrayElemAt: ['$destinationInfo.images.url', 0] },
          tourCount: '$tourCount'
        }
      }
    ]);
    return destinations;
  }
}
