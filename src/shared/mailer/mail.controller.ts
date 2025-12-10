import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/core/decorator/customize.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SendResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';


@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
  ) {}

  @Post('reset-password')
  @Public()
  @ApiBody({ type: SendResetPasswordDto })
  @ResponseMessage("Reset password code has sent!")
  async handleResetPassword(
    @Body() sendResetPasswordDto: SendResetPasswordDto
  ) {
    return this.mailService.sendResetPasswordEmail(sendResetPasswordDto);
  }

  // @Post('qr-test')
  // @Public()
  // async qrTest() {
  //   const email = 'prezzgts@gmail.com',
  //     fullName = 'John Doe',
  //     token = 'ABC123XYZ',
  //     tourName = 'Amazing Thailand Tour',
  //     tourDate = new Date('2024-12-25'),
  //     numberOfGuests = 2,
  //     paymentProvider = 'VNPAY',
  //     totalPrice = 5000000;
  //   await this.mailService.sendConfirmationEmail(
  //     email,
  //     fullName,
  //     token,
  //     tourName,
  //     tourDate,
  //     numberOfGuests,
  //     paymentProvider,
  //     totalPrice,
  //   );
  // }
}