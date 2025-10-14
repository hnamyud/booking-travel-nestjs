import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttractionTicketDto } from './dto/create-attraction-ticket.dto';
import { UpdateAttractionTicketDto } from './dto/update-attraction-ticket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AttractionTicket, AttractionTicketDocument } from './schemas/attraction-ticket.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose, { mongo } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class AttractionTicketsService {
  constructor(@InjectModel(AttractionTicket.name) private attractionTicketModel: SoftDeleteModel<AttractionTicketDocument>) {}

  async create(createAttractionTicketDto: CreateAttractionTicketDto) {
    const {
      attraction_name,
      location,
      price,
      valid_from,
      valid_to,
      ticket_type,
      images,
      includes
    } = createAttractionTicketDto;

    const newAttractionTicket = await this.attractionTicketModel.create({
      attraction_name,
      location,
      price,
      ticket_type,
      valid_from,
      valid_to,
      includes,
      images
    });
    return newAttractionTicket;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.attractionTicketModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.attractionTicketModel.find(filter)
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
      return `Not found attraction ticket`;
    };
    return await this.attractionTicketModel.findOne({
      _id: id
    });
  }

  async update(id: string, updateAttractionTicketDto: UpdateAttractionTicketDto) {
    const { ...updateData } = updateAttractionTicketDto;
        
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.attractionTicketModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found attraction ticket`);
    }
    return this.attractionTicketModel.softDelete({
      _id: id
    });
  }
}
