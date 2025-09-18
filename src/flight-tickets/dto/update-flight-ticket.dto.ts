import { PartialType } from '@nestjs/mapped-types';
import { CreateFlightTicketDto } from './create-flight-ticket.dto';

export class UpdateFlightTicketDto extends PartialType(CreateFlightTicketDto) {}
