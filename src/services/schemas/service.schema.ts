import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ServiceDocument = HydratedDocument<Service>;
@Schema({ timestamps: true })
export class Service {

    @Prop()
    name: string;

    @Prop({
        enum: ['HotelBooking', 'FlightTicket', 'AttractionTicket'],
        required: true
    })
    type: string; // e.g., "flight", "hotel", "car_rental"

    @Prop({ 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'type' // Tham chiếu động dựa vào giá trị của trường type
    })
    type_id: mongoose.Schema.Types.ObjectId;

    @Prop()
    description: string;
    
    @Prop()
    price: number;

    @Prop()
    isAvailable: boolean;

    @Prop()
    createdAt: Date;
    
    @Prop()
    updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
