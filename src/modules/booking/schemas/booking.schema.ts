import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { StatusBooking } from "src/common/enum/status-booking.enum";
import { StatusPayment } from "src/common/enum/status-payment.enum";

export type BookingDocument = HydratedDocument<Booking>;
@Schema({ timestamps: true })
export class Booking {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true })
    tour_id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user_id: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, min: 1 })
    numberOfGuests: number;

    @Prop()
    promotion_id?: mongoose.Schema.Types.ObjectId;

    @Prop({ min: 0 })
    discountAmount?: number;

    @Prop({ required: true, min: 0 })
    originalPrice: number;

    @Prop({ required: true, min: 0 })
    totalPrice: number;

    @Prop({ type: String, enum: StatusBooking, default: StatusBooking.Pending })
    status: StatusBooking;

    @Prop({ type: String, enum: StatusPayment, default: StatusPayment.Pending })
    payment_status: StatusPayment;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' })
    payment_id?: mongoose.Schema.Types.ObjectId;

    @Prop({ type: Object })
    contactInfo?: {
        fullName: string;
        phone: string;
        email: string;
    };

    @Prop()
    note?: string;

    @Prop({ required: true })
    startDate: Date; // Ngày  đi

    @Prop({ required: true, index: true }) // Index for Cronjob
    endDate: Date; // Ngày  về

    @Prop()
    ticketCode?: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    confirmAt: Date;

    @Prop({ default: false })
    isUsed: boolean;

    @Prop()
    checkinAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
