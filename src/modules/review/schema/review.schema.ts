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
    provider: string;

    @Prop()
    rating: number;

    @Prop()
    comment: string;

    @Prop()
    upvotes: number;

    @Prop()
    downvotes: number;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
