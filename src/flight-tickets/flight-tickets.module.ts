import { Module } from '@nestjs/common';
import { FlightTicketsService } from './flight-tickets.service';
import { FlightTicketsController } from './flight-tickets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightTicket, FlightTicketSchema } from './schemas/flight-ticket.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: FlightTicket.name, schema: FlightTicketSchema }])],
  controllers: [FlightTicketsController],
  providers: [FlightTicketsService]
})
export class FlightTicketsModule {}
