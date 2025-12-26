import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/core/abilities/casl.module';
import { Booking, BookingSchema } from '../booking/schemas/booking.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Booking.name, schema: BookingSchema },
        ]),
        CaslModule
    ],
    controllers: [StatisticController],
    providers: [StatisticService],
})
export class StatisticModule { }