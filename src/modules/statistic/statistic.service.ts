import { GetRevenueStatsDto } from './dto/get-revenue-stats';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from '../review/schema/review.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
import mongoose, { Model } from 'mongoose';
import { StatusPayment } from 'src/common/enum/status-payment.enum';
import { StatusBooking } from 'src/common/enum/status-booking.enum';

@Injectable()
export class StatisticService {
    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>
    ) { }

    getRevenueStats = async (dto: GetRevenueStatsDto) => {
        const { fromDate, toDate, tourId } = dto;

        const matchStage: any = {
            payment_status: StatusPayment.Success,
            status: { $in: [StatusBooking.Completed, StatusBooking.Confirmed] },
        }
        if (fromDate || toDate) {
            matchStage.updatedAt = {};
            if (fromDate) matchStage.updatedAt.$gte = new Date(fromDate);
            if (toDate) matchStage.updatedAt.$lte = new Date(toDate);
        }

        if (tourId) matchStage.tour_id = new mongoose.Types.ObjectId(tourId);

        const stats = await this.bookingModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: tourId ? "$tour_id" : null,
                    totalRevenue: { $sum: '$totalPrice' }, // Cộng tổng tiền
                    totalBookings: { $sum: 1 },            // Đếm số đơn
                    totalGuests: { $sum: '$numberOfGuests' } // Đếm tổng khách
                }
            },
            {
                $lookup: {
                    from: 'tours', // Tên collection trong DB
                    localField: '_id',
                    foreignField: '_id',
                    as: 'tourInfo'
                }
            },
            {
                $project: {
                    _id: 0,
                    tourId: '$_id',
                    tourName: { $arrayElemAt: ['$tourInfo.name', 0] },
                    totalRevenue: 1,
                    totalBookings: 1,
                    totalGuests: 1
                }
            },
            { $sort: { totalRevenue: -1 } } // Sắp xếp doanh thu cao nhất lên đầu
        ]);

        const summary = stats.reduce((acc, curr) => ({
            revenue: acc.revenue + curr.totalRevenue,
            bookings: acc.bookings + curr.totalBookings
        }), { revenue: 0, bookings: 0 });

        return {
            filter: dto,
            summary,
            breakdown: stats
        };
    }

    getTopBookedTours = async (limit: number = 5) => {
        const stats = await this.bookingModel.aggregate([
            {
                $match: {
                    payment_status: StatusPayment.Success,
                    status: { $in: [StatusBooking.Completed, StatusBooking.Confirmed] },
                }
            },
            {
                $group: {
                    _id: '$tour_id',
                    totalBookings: { $sum: 1 },
                    totalParticipants: { $sum: '$numberOfGuests' },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { totalParticipants: -1, totalRevenue: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'tours',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'tourInfo'
                }
            },
            {
                $project: {
                    _id: 0,
                    tourId: '$_id',
                    tourName: '$tourInfo.name',
                    totalBookings: 1,
                    totalParticipants: 1,
                    totalRevenue: 1
                }
            }
        ]);

        return stats;
    }
}