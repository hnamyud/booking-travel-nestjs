import { IsNotEmpty, IsOptional, Max, Min } from "class-validator";
import mongoose from "mongoose";

export class CreateReviewDto {
    @IsNotEmpty({ message: 'ID tour không được bỏ trống' })
    tour_id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Đánh giá không được bỏ trống' })
    @Min(0, { message: 'Đánh giá phải lớn hơn hoặc bằng 0' })
    @Max(5, { message: 'Đánh giá phải nhỏ hơn hoặc bằng 5' })
    rating: number;

    @IsOptional()
    comment?: string;
}
