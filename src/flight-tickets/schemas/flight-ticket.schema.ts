import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type FlightTicketDocument = HydratedDocument<FlightTicket>;
@Schema({ timestamps: true })
export class FlightTicket {

    @Prop()
    airline: string;

    @Prop()
    flight_number: string;

    @Prop()
    departure: string;

    @Prop()
    arrival: string;

    @Prop()
    departure_time: Date;

    @Prop()
    arrival_time: Date;
        
    @Prop()
    seat_class: string;

    @Prop()
    createdAt: Date;
    
    @Prop()
    updatedAt: Date;
}

export const FlightTicketSchema = SchemaFactory.createForClass(FlightTicket);
