import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Destination } from "src/modules/destination/schema/destination.schema";

export type TourDocument = HydratedDocument<Tour>;

@Schema({
    timestamps: true,
    toJSON: { virtuals: true }, // Virtual field
    toObject: { virtuals: true }
})
export class Tour {
    @Prop({ required: true, index: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    duration: string;

    @Prop({ required: true })
    durationDays: number;

    @Prop()
    price: number;

    @Prop()
    timeStart: Date;

    @Prop()
    timeEnd: Date;

    @Prop({ required: true, min: 0 })
    totalSlots: number;

    @Prop({ required: true, min: 0, index: true })
    availableSlots: number;

    @Prop({ default: 0 })
    bookedParticipants: number;

    @Prop({ default: true, index: true })
    isAvailable: boolean;

    @Prop({
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Destination'
        }]
    })
    destinations: Destination[];

    @Prop()
    ratingAverage: number;

    @Prop()
    ratingQuantity: number;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

// --- VIRTUAL POPULATE (Review) ---
// Giúp bro lấy review của tour mà không cần lưu review vào trong tour
const TourSchema = SchemaFactory.createForClass(Tour);
TourSchema.virtual('reviews', {
    ref: 'Review',          // Tên model Review
    localField: '_id',      // Khớp _id của Tour
    foreignField: 'tour_id', // với trường tour_id bên Review
    justOne: false,          // Lấy danh sách (mảng) chứ không phải 1 cái
    options: { sort: { rating: -1 } } // (Tùy chọn) Lấy review điểm cao lên trước
});

// Middleware: Tự động tính availableSlots khi tạo (Optional)
// TourSchema.pre('save', function(next) {
//    if (this.isNew) {
//        this.availableSlots = this.totalSlots;
//    }
//    next();
// });

export { TourSchema };
