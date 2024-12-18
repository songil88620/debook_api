import {
  BadRequestException,
  Body,
  Controller,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { LineService } from './line.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(AnyFilesInterceptor())
  async createLine(
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: any,
    @Body() data: any,
  ) {
    try {
      const videoFile = files.find((file) => file.fieldname === 'file');
      const thumbnailFile = files.find(
        (file) => file.fieldname === 'thumbnail',
      );

      if (!videoFile.mimetype.match(/video\/(mp4)/)) {
        throw new BadRequestException('Video file must be of type MP4.');
      }
      if (!thumbnailFile.mimetype.match(/image\/(jpeg|png)/)) {
        throw new BadRequestException('Image file must be JPEG or PNG.');
      }

      const thumbnailFileName = user.uid + '_line_thmb_' + Date.now();
      const videoFileName = user.uid + '_line_' + Date.now();
      const [resVideoFile, resThumbnailFile] = await Promise.all([
        this.uploadService.saveFileOnS3(videoFile, 'line', videoFileName),
        this.uploadService.saveFileOnS3(
          thumbnailFile,
          'line-thumbnail',
          thumbnailFileName,
        ),
      ]);

      if (resVideoFile.status && resThumbnailFile.status) {
        const video_url = resVideoFile.file_url;
        const inPath = video_url.split('/').slice(-2).join('/');
        data.file = video_url;
        data.thumbnail = resThumbnailFile.file_url;
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
