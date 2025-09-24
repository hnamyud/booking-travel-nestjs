import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type HotelBookingDocument = HydratedDocument<HotelBooking>;
@Schema({ timestamps: true })
export class HotelBooking {
    @Prop()
    service_id: mongoose.Schema.Types.ObjectId;

    @Prop()
    hotel_name: string;

    @Prop()
    address: string;
    
    @Prop()
    room_type: string;

    @Prop()
    check_in_date: Date;

    @Prop()
    check_out_date: Date;

    @Prop({ type: [String] })
    amenities: string[];

    @Prop()
    createdAt: Date;
    
    @Prop()
    updatedAt: Date;
}
export const HotelBookingSchema = SchemaFactory.createForClass(HotelBooking);