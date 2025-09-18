import { Module } from '@nestjs/common';
import { AttractionTicketsService } from './attraction-tickets.service';
import { AttractionTicketsController } from './attraction-tickets.controller';

@Module({
  controllers: [AttractionTicketsController],
  providers: [AttractionTicketsService]
})
export class AttractionTicketsModule {}
