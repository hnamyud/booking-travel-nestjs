import { Module } from '@nestjs/common';
import { AttractionTicketsService } from './attraction-tickets.service';
import { AttractionTicketsController } from './attraction-tickets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AttractionTicket, AttractionTicketSchema } from './schemas/attraction-ticket.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AttractionTicket.name, schema: AttractionTicketSchema }])],
  controllers: [AttractionTicketsController],
  providers: [AttractionTicketsService]
})
export class AttractionTicketsModule {}
