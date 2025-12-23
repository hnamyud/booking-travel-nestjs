import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type DestinationDocument = HydratedDocument<Destination>;

export interface CloudinaryImage {
  url: string;
  public_id: string;
}
@Schema({ 
  timestamps: true,
  toJSON: { virtuals: true }, // Virtual field
  toObject: { virtuals: true }
})
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
DestinationSchema.virtual('topTours', {
  ref: 'Tour',
  localField: '_id',
  foreignField: 'destinations',
  justOne: false,
  options: { 
    sort: { 
      ratingAverage: -1 
    }, 
    limit: 5 
  }
})