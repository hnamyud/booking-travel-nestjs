import { IsNotEmpty } from "class-validator";

export class CreateServiceDto {
    @IsNotEmpty({ message: 'Tên dịch vụ không được bỏ trống' })
    name: string;

    @IsNotEmpty({ message: 'Loại dịch vụ không được bỏ trống' })
    type: string; // e.g., "flight", "hotel", "car_rental"

    @IsNotEmpty({ message: 'Mô tả dịch vụ không được bỏ trống' })
    description: string;

    @IsNotEmpty({ message: 'Giá dịch vụ không được bỏ trống' })
    price: number;

    @IsNotEmpty({ message: 'Trạng thái dịch vụ không được bỏ trống' })
    isAvailable: boolean;
}
