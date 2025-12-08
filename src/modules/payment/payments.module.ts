import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/modules/casl/casl.module';
import { VnpayModule } from '../vnpay';
import { BookingsService } from '../booking/bookings.service';
import { BookingsModule } from '../booking/bookings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    CaslModule,
    BookingsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
