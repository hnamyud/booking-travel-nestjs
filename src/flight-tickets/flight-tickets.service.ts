import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFlightTicketDto } from './dto/create-flight-ticket.dto';
import { UpdateFlightTicketDto } from './dto/update-flight-ticket.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { FlightTicket, FlightTicketDocument } from './schemas/flight-ticket.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { mongo } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class FlightTicketsService {
  constructor(@InjectModel(FlightTicket.name) private flightTicketModel: SoftDeleteModel<FlightTicketDocument>) {}

  async create(createFlightTicketDto: CreateFlightTicketDto) {
    const {
      airline,
      flight_number,
      departure,
      arrival,
      departure_time,
      arrival_time,
      seat_class
    } = createFlightTicketDto;

    const newFlightTicket = await this.flightTicketModel.create({
      airline,
      flight_number,
      departure,
      arrival,
      departure_time,
      arrival_time,
      seat_class
    });
    return newFlightTicket;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.flightTicketModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.flightTicketModel.find(filter)
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
      return `Not found flight ticket`;
    };
    return await this.flightTicketModel.findOne({
      _id: id
    });
  }

  async update(id: string, updateFlightTicketDto: UpdateFlightTicketDto) {
    const { ...updateData } = updateFlightTicketDto;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.flightTicketModel.updateOne(
      { _id: id },
      { $set: updateData } // Sử dụng $set operator
    );
    return result;
  }

  remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found flight ticket`);
    }
    return this.flightTicketModel.softDelete({
      _id: id
    });
  }
}
