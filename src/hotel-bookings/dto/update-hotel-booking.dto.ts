import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelBookingDto } from './create-hotel-booking.dto';

export class UpdateHotelBookingDto extends PartialType(CreateHotelBookingDto) {}
