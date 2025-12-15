import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class UpdateReviewDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Đánh giá không được bỏ trống' })
    @Min(0, { message: 'Đánh giá phải lớn hơn hoặc bằng 0' })
    @Max(5, { message: 'Đánh giá phải nhỏ hơn hoặc bằng 5' })
    rating: number;

    @ApiProperty()
    @IsOptional()
    comment?: string;
}
