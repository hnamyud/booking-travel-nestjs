import { Module } from '@nestjs/common';
import { TourService } from './tour.service';
import { TourController } from './tour.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tour, TourSchema } from './schema/tour.schema';
import { CaslModule } from 'src/modules/casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tour.name, schema: TourSchema }]),
    CaslModule
  ],
  controllers: [TourController],
  providers: [TourService]
})
export class TourModule {}
