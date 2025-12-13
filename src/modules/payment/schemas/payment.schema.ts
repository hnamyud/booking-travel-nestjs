import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { StatusPayment } from "src/common/enum/status-payment.enum";

export type PaymentDocument = HydratedDocument<Payment>;
@Schema({ timestamps: true })
export class Payment {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true })
    booking_id: mongoose.Schema.Types.ObjectId;
        
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user_id: mongoose.Schema.Types.ObjectId;
    
    // 1. Mã thanh toán nội bộ (Tự sinh: PAY_ORDERID_TIME)
    @Prop({ required: true, unique: true, index: true })
    code: string;

    // 2. Mã tham chiếu bên ngoài (Của VNPay, Stripe, hoặc Mã bút toán ngân hàng)
    @Prop({ index: true })
    externalId?: string;

    @Prop({ required: true })
    provider: string
    
    @Prop({ required: true })
    amount: number;

    @Prop({default: 'VND'})
    currency: string;
    
    @Prop({ type: String, enum: StatusPayment, default: StatusPayment.Pending })
    status: StatusPayment;

    @Prop()
    transactionDate: Date;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
