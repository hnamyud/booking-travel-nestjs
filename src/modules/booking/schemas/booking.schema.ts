import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type BookingDocument = HydratedDocument<Booking>;
@Schema({ timestamps: true })
export class Booking {
    @Prop()
    tour_id: mongoose.Schema.Types.ObjectId;
    
    @Prop()
    user_id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: Object })
    payment: {
        _id: mongoose.Schema.Types.ObjectId;
        amount: number;
        method: string;
        status: string;
    }

    @Prop()
    bookingDate: Date;

    @Prop()
    numberOfGuests: number;

    @Prop()
    status: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
