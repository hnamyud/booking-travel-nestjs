import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
    @Prop()
    tour_id: mongoose.Schema.Types.ObjectId;

    @Prop()
    user_id: mongoose.Schema.Types.ObjectId;

    @Prop()
    booking_id: mongoose.Schema.Types.ObjectId;

    @Prop()
    provider: string;

    @Prop()
    rating: number;

    @Prop()
    comment: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ booking_id: 1 }, { unique: true });
