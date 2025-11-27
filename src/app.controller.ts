import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { generateToken } from './config/csrf.config';
import { Public } from './decorator/customize.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Security')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('csrf-token')
  @Public()
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    // 1. Hàm này sẽ tự động:
    // - Tạo ra token mới.
    // - Set một cookie bí mật (CSRF Secret) vào response header.
    const csrfToken = generateToken(req, res);

    // 2. Trả về token cho Frontend dưới dạng JSON
    // Lưu ý: Khi dùng @Res(), bro phải tự handle việc trả response (res.json hoặc res.send)
    return res.json({ 
      csrfToken: csrfToken 
    });
  }
}
