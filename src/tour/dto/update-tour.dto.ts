import { PartialType } from '@nestjs/mapped-types';
import { CreateTourDto } from './create-tour.dto';
import mongoose from 'mongoose';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Destination {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

class Review {
    _id: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

export class UpdateTourDto {
    @IsNotEmpty({ message: 'ID không được bỏ trống' })
    _id: string;

    @IsNotEmpty({message: 'Tên tour không được bỏ trống'})
    name: string;
    
    description: string;
    
    @IsNotEmpty({message: 'Thời gian không được bỏ trống'})
    duration: string;
    
    @IsNotEmpty({message: 'Giá không được bỏ trống'})
    price: number;
    
    @IsNotEmpty({message: 'Thời gian bắt đầu không được bỏ trống'})
    timeStart: Date;
    
    @IsNotEmpty({message: 'Thời gian kết thúc không được bỏ trống'})
    timeEnd: Date;
    
    @IsNotEmpty()
    isAvailable?: boolean;
    
    @IsOptional()
    @ValidateNested()
    @Type(() => Destination)
    destinations?: Destination[];
    
    @IsOptional()
    @ValidateNested()
    @Type(() => Review)
    reviews?: Review[];

    @IsNotEmpty({message: 'Dịch vụ không được bỏ trống'})
    service_id: mongoose.Schema.Types.ObjectId;
}
