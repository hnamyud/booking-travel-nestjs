import { Module } from '@nestjs/common';
import { DateService } from './date.service';
import { DateController } from './date.controller';

@Module({
  controllers: [DateController],
  providers: [DateService]
})
export class DateModule {}
