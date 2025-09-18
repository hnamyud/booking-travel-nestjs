import { Module } from '@nestjs/common';
import { FlightTicketsService } from './flight-tickets.service';
import { FlightTicketsController } from './flight-tickets.controller';

@Module({
  controllers: [FlightTicketsController],
  providers: [FlightTicketsService]
})
export class FlightTicketsModule {}
