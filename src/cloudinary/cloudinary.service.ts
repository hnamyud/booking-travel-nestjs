import { Injectable } from '@nestjs/common';
import { v2, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      const result = await v2.uploader.destroy(publicId);
      return result; // { result: 'ok' } nếu xoá thành công
    } catch (error) {
      throw new Error(`Xoá ảnh thất bại: ${error.message}`);
    }
  }
}
