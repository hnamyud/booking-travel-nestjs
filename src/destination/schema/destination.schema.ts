import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type DestinationDocument = HydratedDocument<Destination>;
@Schema({ timestamps: true })
export class Destination {
    @Prop()
    name: string;

    @Prop()
    country: string;

    @Prop()
    description: string;

    @Prop({ type: Object })
    images: {
        url: string;
        public_id: string;
    };

    @Prop({ type: Object })
    tours: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
        price: number;
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

}

export const DestinationSchema = SchemaFactory.createForClass(Destination);