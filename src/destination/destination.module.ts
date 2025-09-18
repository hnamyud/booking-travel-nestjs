import { Module } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { DestinationController } from './destination.controller';
import { Destination, DestinationSchema } from './schema/destination.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Destination.name, schema: DestinationSchema }]),
    CloudinaryModule
  ],
    controllers: [DestinationController],
    providers: [DestinationService],
    exports: [DestinationService]
})
export class DestinationModule {}
