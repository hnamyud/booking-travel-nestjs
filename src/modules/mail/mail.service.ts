
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import Redis from 'ioredis';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { SendResetPasswordDto } from '../auth/dto/reset-password.dto';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly userService: UserService,
        @Inject('REDIS_CLIENT') private redisClient: Redis,
        private configService: ConfigService,
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
        const subject = 'Reset Password Request';
        const otp = this.generateRandomOtp();
        await this.redisClient.set(`reset_otp:${sendResetPasswordDto.email}`, otp, 'EX', 300);
        
        // Tăng counter rate limit (15 phút)
        await this.redisClient.incr(rateLimitKey);
        await this.redisClient.expire(rateLimitKey, 900); // 15 phút
        try {
            await this.mailerService.sendMail({
                to: sendResetPasswordDto.email,
                from: this.configService.get<string>('MAIL_FROM') || '"Support Team" <no-reply@domain.com>',
                subject,
                template: 'D:\\booking-travel-nestjs\\src\\mail\\templates\\reset-password.hbs',
                context: {
                    otp,
                    year: new Date().getFullYear(),
                },
            });
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            // Tùy business mà throw lỗi hoặc return false
            throw error; 
        }
    }
}
