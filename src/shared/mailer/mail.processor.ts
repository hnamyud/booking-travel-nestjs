import { Process, Processor } from "@nestjs/bull";
import { MailerService } from "@nestjs-modules/mailer";
import { Job } from "bull";
import { ConfigService } from "@nestjs/config";
import { QRCodeService } from "../qrcode/qrcode.service";


@Processor('mail-queue')
export class MailProcessor {
    constructor(
        private readonly mailerService: MailerService,
        private configService: ConfigService,
        private qrService: QRCodeService,
    ) { }

    @Process('send-reset-password')
    async handleResetPasswordEmail(job: Job<any>) {
        const { email, subject, otp } = job.data;
        await this.mailerService.sendMail({
            to: email,
            from: this.configService.get<string>('MAIL_FROM') || '"Support Team" <no-reply@domain.com>',
            subject,
            template: 'reset-password',
            context: {
                otp,
                year: new Date().getFullYear(),
            },
        });
    }

    @Process('send-confirmation-email')
    async handleConfirmationEmail(job: Job<any>) {
        const { 
            email, 
            subject, 
            fullName, 
            token, 
            tourName, 
            formattedDate,            
            numberOfGuests, 
            provider,
            formattedPrice,
        } = job.data;
        const qrBuffer = await this.qrService.generateQrCodeAsBuffer(token);
        await this.mailerService.sendMail({
            to: email,
            from: this.configService.get<string>('MAIL_FROM'),
            subject,
            template: 'confirm-booking',
            context: {
                customerName: fullName,
                ticketCode: token,
                tourName,
                startDate: formattedDate,
                numberOfGuests,
                provider,
                totalPrice: formattedPrice,
                qrCode: 'cid:qrCode@booking-travel',
            },
            attachments: [
                {
                    filename: 'ticket-qr.png',
                    content: qrBuffer,
                    cid: 'qrCode@booking-travel'
                }
            ]
        });
    }

}