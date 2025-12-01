import { PartialType } from '@nestjs/mapped-types';
import { CreateTourDto } from './create-tour.dto';
import mongoose from 'mongoose';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class Destination {
    @ApiProperty()
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty()
    name: string;
}

class Review {
    @ApiProperty({type: mongoose.Schema.Types.ObjectId})
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty()
    rating: number;

    @ApiProperty()
    @IsNotEmpty()
    comment: string;

    @ApiProperty()
    @IsNotEmpty()
    createdAt: Date;
}

export class UpdateTourDto {

    @ApiProperty()
    @IsNotEmpty({message: 'Tên tour không được bỏ trống'})
    name: string;
    
    @ApiProperty()
    description: string;
    
    @ApiProperty()
    @IsNotEmpty({message: 'Thời gian không được bỏ trống'})
    duration: string;
    
    @ApiProperty()
    @IsNotEmpty({message: 'Giá không được bỏ trống'})
    price: number;
    
    @ApiProperty()
    @IsNotEmpty({message: 'Thời gian bắt đầu không được bỏ trống'})
    timeStart: Date;
    
    @ApiProperty()
    @IsNotEmpty({message: 'Thời gian kết thúc không được bỏ trống'})
    timeEnd: Date;
    
    @ApiProperty()
    @IsNotEmpty()
    isAvailable?: boolean;
    
    @ApiProperty({type: [Destination]})
    @IsOptional()
    @ValidateNested()
    @Type(() => Destination)
    destinations?: Destination[];
    
    @ApiProperty({type: [Review]})
    @IsOptional()
    @ValidateNested()
    @Type(() => Review)
    reviews?: Review[];
}
