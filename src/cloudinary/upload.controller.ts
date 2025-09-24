import { Controller, Delete, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5)) // Tối đa 5 file
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadPromises = files.map(file => this.cloudinaryService.uploadFile(file));
    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults.map(result => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));
  }

  @Delete(':publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    return await this.cloudinaryService.deleteImage(publicId);
  }
}