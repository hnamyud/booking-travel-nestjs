import { PartialType } from '@nestjs/mapped-types';
import { CreateAttractionTicketDto } from './create-attraction-ticket.dto';

export class UpdateAttractionTicketDto extends PartialType(CreateAttractionTicketDto) {}
