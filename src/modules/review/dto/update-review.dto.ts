import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
    _id: string;
}
