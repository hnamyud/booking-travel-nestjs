import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
    async generateQrCode(data: string): Promise<string> {
        try {
            // Generate QR code as a data URL (e.g., base64 encoded PNG)
            const qrCodeDataUrl = await QRCode.toDataURL(data, { errorCorrectionLevel: 'H' });
            return qrCodeDataUrl;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    async generateQrCodeAsBuffer(data: string): Promise<Buffer> {
        try {
            // Generate QR code as a PNG buffer
            const qrCodeBuffer = await QRCode.toBuffer(data, { type: 'png', errorCorrectionLevel: 'H' });
            return qrCodeBuffer;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }
}