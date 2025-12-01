import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Destination {
    @ApiProperty()
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty()
    name: string;
}

class Review {
    _id: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

export class CreateTourDto {
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
    isAvailable: boolean;

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => Destination)
    destinations: Destination[];

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => Review)
    reviews?: Review[];
}
