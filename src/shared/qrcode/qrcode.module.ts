import { QRCode } from './../../../node_modules/@types/qrcode/index.d';
import { Module } from '@nestjs/common';
import { QRCodeService } from './qrcode.service';

@Module({
  providers: [QRCodeService],
  exports: [QRCodeService],
})  
export class QRCodeModule {}