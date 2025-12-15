import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { CaslModule } from 'src/core/abilities/casl.module';
import { LockService } from 'src/common/services/lock.services';
import { Tour, TourSchema } from '../tour/schema/tour.schema';
import { RedisModule } from '../../shared/cache/redis.module';
import { PaymentsModule } from '../payment/payments.module';
import { BookingScheduler } from './bookings.scheduler';
import { Payment, PaymentSchema } from '../payment/schemas/payment.schema';
import { MailModule } from 'src/shared/mailer/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Tour.name, schema: TourSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    CaslModule,
    RedisModule,
    MailModule 
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingScheduler,
  ],
  exports: [BookingsService]
})
export class BookingsModule {}
