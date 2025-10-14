import { Module } from '@nestjs/common';
import { AttractionTicketsService } from './attraction-tickets.service';
import { AttractionTicketsController } from './attraction-tickets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AttractionTicket, AttractionTicketSchema } from './schemas/attraction-ticket.schema';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AttractionTicket.name, schema: AttractionTicketSchema }]),
    CaslModule
  ],
  controllers: [AttractionTicketsController],
  providers: [AttractionTicketsService]
})
export class AttractionTicketsModule {}
