import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { TagType } from 'src/enum/tag-type.enum';

export type DestinationDocument = HydratedDocument<Destination>;
@Schema({ timestamps: true })
export class Destination {
    @Prop()
    name: string;

    @Prop()
    country: string;

    @Prop()
    description: string;

    @Prop({ 
        type: [String],
        enum: Object.values(TagType), 
        default: [], 
    })
    tags: TagType[];

    @Prop({ type: Object })
    images: {
        url: string;
        public_id: string;
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

}

export const DestinationSchema = SchemaFactory.createForClass(Destination);