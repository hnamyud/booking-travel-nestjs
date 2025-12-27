
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
import { Model } from 'mongoose';
import { StatusPayment } from 'src/common/enum/status-payment.enum';
import { StatusBooking } from 'src/common/enum/status-booking.enum';
import { Tour, TourDocument } from '../tour/schema/tour.schema';
import { User, UserDocument } from '../user/schema/user.schema';

@Injectable()
export class StatisticService {
    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

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
                $sort: { totalRevenue: -1, totalParticipants: -1 }
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

    getOverviewStats = async () => {
        const totalRevenue = await this.bookingModel.aggregate([
            {
                $match: {
                    status: { $in: [StatusBooking.Completed, StatusBooking.Confirmed] },
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalTours = await this.tourModel.countDocuments({ isDeleted: false });
        const totalUsers = await this.userModel.countDocuments({ isDeleted: false });

        return {
            revenue: totalRevenue[0]?.revenue || 0,
            bookings: totalRevenue[0]?.count || 0,
            tours: totalTours,
            users: totalUsers
        }
    }

    getRevenueChart = async () => {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        return this.bookingModel.aggregate([
            {
                $match: {
                    status: { $in: [StatusBooking.Confirmed, StatusBooking.Completed] },
                    createdAt: { $gte: sixMonthsAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { 
                        $dateTrunc: { date: "$createdAt", unit: "month" } 
                    },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $densify: {
                    field: "_id",
                    range: {
                        step: 1,
                        unit: "month",
                        bounds: [sixMonthsAgo, new Date(today.getFullYear(), today.getMonth() + 1, 1)]
                    }
                }
            },
            {
                $fill: {
                    output: {
                        revenue:{ value: 0 }
                    }
                }
            },
            {
                // Convert sang String đẹp để trả về FE
                $project: {
                    _id: 0,
                    date: { $dateToString: { format: "%Y-%m", date: "$_id" } },
                    revenue: 1
                }
            },
            { $sort: { _id: 1 } }
        ]);

    }
}