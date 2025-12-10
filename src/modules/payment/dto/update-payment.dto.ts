import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { StatusPayment } from "src/common/enum/status-payment.enum";


export class UpdatePaymentDto {
    @ApiProperty()
    @IsEnum(StatusPayment)
    @IsNotEmpty()
    status: StatusPayment;
}
