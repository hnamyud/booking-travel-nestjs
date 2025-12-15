import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tour, TourDocument } from './schema/tour.schema';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TourScheduler {
    private readonly logger = new Logger(TourScheduler.name);
    constructor(
        @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Chạy hàng ngày vào lúc nửa đêm
    async handleTimeExpiredTours() {
        this.logger.log('Checking for expired tours...');
        const now = new Date();
        // Update tất cả tour đã hết hạn
        const result = await this.tourModel.updateMany(
            { 
                isAvailable: true, 
                timeEnd: { $lt: now } // Chỉ đóng khi ngày hiện tại đã vượt quá timeEnd
            },
            { 
                $set: { 
                    isAvailable: false,
                    updatedAt: new Date()
                } 
            }
        );

        if (result.modifiedCount > 0) {
            this.logger.log(`🌙 Closed ${result.modifiedCount} tours that have passed timeEnd.`);
        } else {
            this.logger.log('✨ No tours to close!');
        }
    }
}