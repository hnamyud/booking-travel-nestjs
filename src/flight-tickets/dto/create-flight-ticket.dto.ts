import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateFlightTicketDto {
    @IsNotEmpty({ message: 'ID dịch vụ không được bỏ trống' })  
    service_id: mongoose.Schema.Types.ObjectId;
    
    @IsNotEmpty({ message: 'Hãng hàng không không được bỏ trống' })
    airline: string;
    
    @IsNotEmpty({ message: 'Số hiệu chuyến bay không được bỏ trống' })
    flight_number: string;
  
    @IsNotEmpty({ message: 'Nơi khởi hành không được bỏ trống' })
    departure: string;
       
    @IsNotEmpty({ message: 'Nơi đến không được bỏ trống' })
    arrival: string;
     
    @IsNotEmpty({ message: 'Thời gian khởi hành không được bỏ trống' })
    departure_time: Date;
    
    @IsNotEmpty({ message: 'Thời gian đến không được bỏ trống' })
    arrival_time: Date;

    @IsNotEmpty({ message: 'Hạng ghế không được bỏ trống' })
    seat_class: string;
    
    createdAt: Date;
        
    updatedAt: Date;

}
