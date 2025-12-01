import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type DestinationDocument = HydratedDocument<Destination>;

export interface CloudinaryImage {
  url: string;
  public_id: string;
}
@Schema({ timestamps: true })
export class Destination {
    @Prop()
    name: string;

    @Prop()
    country: string;

    @Prop()
    description: string;

    @Prop({ 
      type: [{ url: String, public_id: String }], // ✅ Array of objects
      required: true 
    })
    images: CloudinaryImage[];

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

}

export const DestinationSchema = SchemaFactory.createForClass(Destination);