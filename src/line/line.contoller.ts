import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { LineService } from './line.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { ContentDto, LineCreateDto } from './dtos';
import { LinecommentService } from 'src/linecomment/linecomment.service';
import { LIKE_TYPE } from 'src/enum';

@Controller('lines')
export class LineController {
  constructor(
    private lineService: LineService,
    @Inject(forwardRef(() => UploadService))
    private uploadService: UploadService,
    @Inject(forwardRef(() => LinecommentService))
    private linecommentService: LinecommentService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  async createLine(
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: any,
    @Body() data: LineCreateDto,
  ) {
    try {
      const videoFile = files.find((file) => file.fieldname === 'file');
      const thumbnailFile = files.find(
        (file) => file.fieldname === 'thumbnail',
      );

      if (!videoFile.mimetype.match(/video\/(mp4|quicktime)/)) {
        throw new BadRequestException('Video file must be of type MP4 or MOV.');
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

  @Post(':lineId/like')
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
  async likeOrUnlike(@User() user: any, @Param('lineId') lineId: number) {
    await this.lineService.likeOrUnlike(user.uid, lineId);
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
  async getLines(
    @User() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.lineService.getLines(user.uid, page, limit);
  }

  @Delete(':lineId')
  @UseGuards(FirebaseAuthGuard)
  async deleteLine(@User() user: any, @Param('lineId') lineId: number) {
    await this.lineService.deleteLineOne(user.uid, lineId);
  }

  @Post(':lineId/comments')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'create a comment',
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
  async createComment(
    @User() user: any,
    @Param('lineId') lineId: number,
    @Body() data: ContentDto,
  ) {
    return await this.linecommentService.createComment(
      user.uid,
      lineId,
      data.content,
    );
  }

  @Get(':lineId/comments')
  @UseGuards(FirebaseAuthGuard)
  async getComments(@User() user: any, @Param('lineId') lineId: number) {
    return await this.linecommentService.getComments(lineId, user.uid);
  }

  @Delete(':lineId/comments/:commentId')
  @UseGuards(FirebaseAuthGuard)
  async deleteComments(
    @User() user: any,
    @Param('lineId') lineId: number,
    @Param('commentId') commentId: number,
  ) {
    await this.linecommentService.deleteComment(lineId, commentId, user.uid);
  }

  @Post(':lineId/comments/:commentId/reply')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'reply a comment',
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
  async replyComment(
    @User() user: any,
    @Param('lineId') lineId: number,
    @Param('commentId') commentId: number,
    @Body() data: ContentDto,
  ) {
    return await this.linecommentService.replyComment(
      user.uid,
      lineId,
      commentId,
      data.content,
    );
  }

  @Post(':lineId/comments/:commentId/like')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'like or unlike a comment',
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
  async likeOrUnlikeComment(
    @User() user: any,
    @Param('lineId') lineId: number,
    @Param('commentId') commentId: number,
  ) {
    return await this.linecommentService.likeOrUnlikeComment(
      user.uid,
      commentId,
      LIKE_TYPE.COMMENT,
    );
  }
}
