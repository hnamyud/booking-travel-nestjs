import { Module } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { DestinationController } from './destination.controller';
import { Destination, DestinationSchema } from './schema/destination.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/core/abilities/casl.module';
import { CloudinaryModule } from 'src/shared/upload/cloudinary.module';
import { Tour, TourSchema } from '../tour/schema/tour.schema';
import { RedisModule } from 'src/shared/cache/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Destination.name, schema: DestinationSchema },
      { name: Tour.name, schema: TourSchema }
    ]),
    CloudinaryModule,
    RedisModule,
    CaslModule
  ],
    controllers: [DestinationController],
    providers: [DestinationService],
    exports: [DestinationService]
})
export class DestinationModule {}
