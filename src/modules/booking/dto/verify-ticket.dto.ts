import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyTicketDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Mã vé không được bỏ trống' })
    @IsString()
    ticketCode: string;
}