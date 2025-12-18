import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UserService } from 'src/modules/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/schema/user.schema';
import { UserModule } from 'src/modules/user/user.module';
import { Destination, DestinationSchema } from 'src/modules/destination/schema/destination.schema';
import { Tour, TourSchema } from 'src/modules/tour/schema/tour.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Destination.name, schema: DestinationSchema },
      { name: Tour.name, schema: TourSchema },
    ]),
    UserModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
