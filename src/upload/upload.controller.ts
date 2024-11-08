import {
  Body,
  Controller,
  HttpStatus,
  Req,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpException,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { UploadService } from './upload.service';

interface Data {
  path: string;
  name: string;
}

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        directory: {
          type: 'string',
        },
      },
    },
  })
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      example: {
        data: {
          file_url: '',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'The user access token is invalid or not present',
    schema: {
      example: {
        error: {
          code: 'UNAUTHORIZED',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'The user does not have permissions for the specific action',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 5000 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
    @Body() data: Data,
  ) {
    try {
      return await this.uploadService.saveFileOnS3(file, data.path, data.name);
    } catch (e) {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
