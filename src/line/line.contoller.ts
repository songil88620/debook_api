import {
  Body,
  Controller,
  FileTypeValidator,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { LineService } from './line.service';
import { LineCreateDto } from './dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@Controller('lines')
export class LineController {
  constructor(
    private lineService: LineService,
    @Inject(forwardRef(() => UploadService))
    private uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Create one line',
    schema: {
      example: {},
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to access',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('video'))
  async createLine(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 5000 }),
          new FileTypeValidator({ fileType: /video\/(mp4)/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @User() user: any,
    @Body() data: LineCreateDto,
  ) {
    try {
      const file_name = user.uid + '_line_' + Date.now();
      const res = await this.uploadService.saveFileOnS3(
        file,
        'line',
        file_name,
      );
      if (res.status) {
        const video_url = res.file_url;
        const inPath = video_url.split('/').slice(1).join('/');
        data.file = video_url;
        return await this.lineService.createLine(user.uid, data, inPath);
      } else {
        throw new HttpException(
          { error: { code: 'FORBIDDEN' } },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post('likeOrUnlike')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Create one line',
    schema: {
      example: {},
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to access',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  async likeOrUnlike(@User() user: any, @Body() data: any) {
    await this.lineService.likeOrUnlike(user.uid, data.lineId);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to access',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  async getLineOne(@User() user: any, @Param('id') id: number) {
    return await this.lineService.getLineOne(user.uid, id);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to access',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  async getLines(@User() user: any) {
    return await this.lineService.getLines(user.uid);
  }
}
