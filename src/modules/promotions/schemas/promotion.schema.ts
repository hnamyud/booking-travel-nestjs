import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { DiscountType } from "src/common/enum/discount-type.enum";

export type PromotionDocument = HydratedDocument<Promotion>;
@Schema({ timestamps: true })
export class Promotion {
    @Prop()
    code: string;

    @Prop({type: String, enum: DiscountType })
    discountType: DiscountType;

    @Prop()
    discountValue: number;

    @Prop()
    maxDiscountAmount: number;

    @Prop()
    minBookingValue: number;

    @Prop()
    usageLimit: number;

    @Prop()
    usageCount: number;

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop()
    isActive: boolean;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
