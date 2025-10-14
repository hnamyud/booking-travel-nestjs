import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './schemas/service.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { FlightTicket } from 'src/flight-tickets/schemas/flight-ticket.schema';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: SoftDeleteModel<ServiceDocument>) {}

  async create(createServiceDto: CreateServiceDto) {
    const {
      name,
      type,
      type_id,
      description,
      price,
      isAvailable
    } = createServiceDto;
    const newService = await this.serviceModel.create({
      name,
      type,
      type_id,
      description,
      price,
      isAvailable
    });
    return newService;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.serviceModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const serviceType = filter.type;
    delete filter.populate;

    let query = this.serviceModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select('-password')
      // @ts-ignore: Unreachable code error
      .sort(sort);
    if (serviceType === 'FlightTicket') {
      query = query.populate({
        path: 'type_id',
        select: 'airline flight_number departure arrival' 
      });
    } else if (serviceType === 'HotelBooking') {
      query = query.populate({
        path: 'type_id',
        select: 'hotel_name address room_type' 
      });
    } else if (serviceType === 'AttractionTicket') {
      query = query.populate({
        path: 'type_id',
        select: 'attraction_name location valid_from valid_to'
      });
    } else {
      // Default populate nếu không có type cụ thể
      query = query.populate('type_id');
    }

    const result = await query.exec();

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
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return `Not found service`;
    };
    const service = await this.serviceModel.findOne({
      _id: id
    });
    return service.populate('type_id');
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const { ...updateData } = updateServiceDto;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.serviceModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found service`);
    }
    return this.serviceModel.softDelete({
      _id: id
    });
  }

}
