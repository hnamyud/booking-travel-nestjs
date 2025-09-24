import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Destination, DestinationDocument } from './schema/destination.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class DestinationService {
  constructor(
    @InjectModel(Destination.name) private destinationModel: SoftDeleteModel<DestinationDocument>,
    private cloudinaryService: CloudinaryService
  ) {}

  async create(createDestinationDto: CreateDestinationDto) {
    const { name, country, description, images } = createDestinationDto;

    // Upload file lên Cloudinary
    // const uploadPromises = files.map(async file =>  await this.cloudinaryService.uploadFile(file));
    // const uploadResults = await Promise.all(uploadPromises);

    // const images = uploadResults.map(result => ({
    //   url: result.secure_url,
    //   public_id: result.public_id
    // }));
    //
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
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.destinationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.destinationModel.find(filter)
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
      return `Not found destination`;
    };
    return await this.destinationModel.findOne({
      _id: id
    });
  }

  async update(id: string, updateDestinationDto: UpdateDestinationDto) {
    const {...updateData } = updateDestinationDto;

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
    if(!mongoose.Types.ObjectId.isValid(id)) {
          throw new BadRequestException(`Not found destination`);
        }
    return this.destinationModel.softDelete({
      _id: id
    });
  }
}
