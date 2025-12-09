import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Public, ResponseMessage } from 'src/core/decorator/customize.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SendResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';


@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
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
}
