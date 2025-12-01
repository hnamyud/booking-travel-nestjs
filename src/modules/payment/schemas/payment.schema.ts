import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type PaymentDocument = HydratedDocument<Payment>;
@Schema({ timestamps: true })
export class Payment {
    @Prop()
    booking_id: mongoose.Schema.Types.ObjectId;
        
    @Prop()
    user_id: mongoose.Schema.Types.ObjectId;
    
    @Prop()
    provider: string
    
    @Prop()
    amount: number;

    @Prop()
    currency: string;
    
    @Prop()
    method: string;
    
    @Prop()
    status: string;
    
    @Prop()
    createdAt: Date;
    
    @Prop()
    updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
