import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type AttractionTicketDocument = HydratedDocument<AttractionTicket>;
@Schema({ timestamps: true })
export class AttractionTicket {
    @Prop()
    attraction_name: string;
    
    @Prop()
    location: string;

    @Prop()
    price: number;

    @Prop()
    valid_from: Date;
    
    @Prop()
    valid_to: Date;

    @Prop()
    ticket_type: string;

    @Prop({ type: Object })
    images: {
        url: string;
        public_id: string;
    };

    @Prop({ type: [String] })
    includes: string[];

    @Prop()
    createdAt: Date;
    
    @Prop()
    updatedAt: Date;
}
export const AttractionTicketSchema = SchemaFactory.createForClass(AttractionTicket);