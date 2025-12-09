import { ApiProperty } from "@nestjs/swagger";

export class ImagesUploadDto {
  @ApiProperty({ 
    type: 'array', 
    items: { 
      type: 'string', 
      format: 'binary' 
    },
    description: 'Upload multiple images (max 5 files)',
    maxItems: 5,
  })
  images: Express.Multer.File[];
}
