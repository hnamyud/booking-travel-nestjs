import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ServiceDocument = HydratedDocument<Service>;
@Schema({ timestamps: true })
export class Service {

    @Prop()
    name: string;

    @Prop()
    type: string; // e.g., "flight", "hotel", "car_rental"

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
