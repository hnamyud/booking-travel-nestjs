import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { Connection, Model } from 'mongoose';
import { Tour, TourDocument } from '../tour/schema/tour.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatusBooking } from 'src/common/enum/status-booking.enum';
import { StatusPayment } from 'src/common/enum/status-payment.enum';

@Injectable()
export class BookingScheduler {
    private readonly logger = new Logger(BookingScheduler.name);

    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(Tour.name) private tourModel: Model<TourDocument>, // 💉 Inject Tour Model
        @InjectConnection() private readonly connection: Connection, // 💉 Inject Connection để tạo Session
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredBookings() {
        this.logger.log('Checking for expired bookings...');

        const timeLimit = 15;
        const threshold = new Date();
        threshold.setMinutes(threshold.getMinutes() - timeLimit);
        const expiredBookings = await this.bookingModel.find({
            status: StatusBooking.Pending, // Chỉ xử lý các booking ở trạng thái Pending
            createdAt: { $lt: threshold },
        }).limit(50); // Giới hạn số lượng để tránh quá tải
        if(expiredBookings.length === 0) return;

        this.logger.log(`Found ${expiredBookings.length} expired bookings.`);

        const result = await Promise.allSettled(
            expiredBookings.map(async (booking) => { 
                const session = await this.connection.startSession();
                session.startTransaction();

                try {
                    // Cập nhật trạng thái booking thành Expired
                    const bookingToUpdate = await this.bookingModel.findOneAndUpdate(
                        {_id: booking._id, status: StatusBooking.Pending},
                        { $set: { status: StatusBooking.Expired, updatedAt: new Date(), payment_status: StatusPayment.Failed } },
                        { session, new: true }
                    );
                    if (!bookingToUpdate) {
                        await session.abortTransaction();
                        return;
                    }

                    // Logic: Cập nhật lại số lượng vé trong Tour
                    await this.tourModel.updateOne(
                        { _id: booking.tour_id },
                        { $inc: { 
                            availableSlots: booking.numberOfGuests,
                            bookedParticipants: -booking.numberOfGuests
                        } },
                        { session }
                    );

                    await session.commitTransaction();
                    this.logger.log(`Booking ${booking._id} marked as expired and tour slots updated.`);
            
                }
                catch (error) {
                    await session.abortTransaction();
                    this.logger.error(`Failed to process expired booking ${booking._id}: ${error.message}`);
                }
                finally {
                    session.endSession();
                }
            })
        );
    }
}