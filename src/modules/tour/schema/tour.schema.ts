import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type TourDocument = HydratedDocument<Tour>;

@Schema({ timestamps: true })
export class Tour {
    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    duration: string;

    @Prop()
    price: number;

    @Prop()
    timeStart: Date;

    @Prop()
    timeEnd: Date;

    @Prop({ required: true })
    totalSlots: number;

    @Prop({ required: true })
    availableSlots: number;

    @Prop()
    isAvailable: boolean;

    @Prop({ type: Object, ref: 'Destination' })
    destinations: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
    };

    @Prop({ type: Object })
    review: {
        _id: mongoose.Schema.Types.ObjectId;
        rating: number;
        comment: string;
        createdAt: Date;
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const TourSchema = SchemaFactory.createForClass(Tour);
