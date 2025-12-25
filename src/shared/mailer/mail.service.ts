
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import Redis from 'ioredis';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { SendResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';
import { UserService } from 'src/modules/user/user.service';
import { QRCodeService } from '../qrcode/qrcode.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class MailService {
    constructor(
        private readonly userService: UserService,
        @Inject('REDIS_CLIENT') private redisClient: Redis,
        private configService: ConfigService,
        @InjectQueue('mail-queue') private mailQueue: Queue,
    ) { }

    // Generate random OTP
    generateRandomOtp(length: number = 6): string {
        return randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
    }

    async sendResetPasswordEmail(sendResetPasswordDto: SendResetPasswordDto) {
        // Kiểm tra rate limit
        const rateLimitKey = `reset_rate_limit:${sendResetPasswordDto.email}`;
        const attempts = await this.redisClient.get(rateLimitKey);
        if (attempts && parseInt(attempts) >= 5) {
            throw new Error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.');
        }
        // Kiểm tra user có tồn tại trước khi gửi mail
        const user = await this.userService.findOneByEmail(sendResetPasswordDto.email);
        if (!user) {
            throw new BadRequestException('Email không tồn tại trong hệ thống');
        }
        const subject = '[Booking Travel] Reset Password Request';
        const otp = this.generateRandomOtp();
        await this.redisClient.set(`reset_otp:${sendResetPasswordDto.email}`, otp, 'EX', 300);

        // Tăng counter rate limit (15 phút)
        await this.redisClient
            .multi()
            .incr(rateLimitKey)
            .expire(rateLimitKey, 900) // 15 phút
            .exec(); 
        await this.mailQueue.add('send-reset-password', {
            email: sendResetPasswordDto.email,
            otp,
            subject: subject
        }, {
            attempts: 3, // Thử lại 3 lần nếu lỗi
            backoff: 5000, // Đợi 5s giữa các lần thử
            removeOnComplete: true,
        });

        return true;
    }

    sendConfirmationEmail = async (
        email: string,
        fullName: string,
        token: string,
        tourName: string,
        startDate: Date,
        numberOfGuests: number,
        provider: string,
        totalPrice: number
    ) => {
        const subject = '[Booking Travel] Email Confirmation';
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(totalPrice);
        const formattedDate = new Date(startDate).toLocaleDateString('vi-VN');

        await this.mailQueue.add('send-confirmation-email', {
            email,
            subject,
            fullName,
            token,
            tourName,
            formattedDate,
            numberOfGuests,
            provider,
            formattedPrice,
        }, {
            attempts: 3, // Thử lại 3 lần nếu lỗi
            backoff: 5000, // Đợi 5s giữa các lần thử
            removeOnComplete: true,
        });

        return true;
    }
}