import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { GetUser, Public, ResponseMessage } from 'src/decorator/customize.decorator';
import { IUser } from 'src/user/user.interface';
import { SendResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { send } from 'process';


@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
  ) {}

  @Post('reset-password')
  @Public()
  @ResponseMessage("Reset password code has sent!")
  async handleResetPassword(
    @Body() sendResetPasswordDto: SendResetPasswordDto
  ) {
    return this.mailService.sendResetPasswordEmail(sendResetPasswordDto);
  }
}
