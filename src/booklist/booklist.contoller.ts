import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Patch,
  Param,
  Delete,
  HttpCode,
  Optional,
  UploadedFile,
  FileTypeValidator,
  ParseFilePipe,
  UseInterceptors,
  forwardRef,
  Inject,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { UserDto } from 'src/user/dtos';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { BooklistCreateDto, BooklistUpdateDto } from './dtos';
import { BooklistService } from './booklist.service';
import { User } from 'src/user/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { LoggerService } from 'src/logger/logger.service';

@Controller('booklists')
export class BooklistController {
  constructor(
    private booklistService: BooklistService,
    @Inject(forwardRef(() => UploadService))
    private uploadService: UploadService,
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'The user has created successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
    },
  })
  async createBookList(
    @User() user: any,
    @Body() booklistCreateDto: BooklistCreateDto,
  ) {
    return this.booklistService.createOne(booklistCreateDto, user.uid);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'The user has created successfully',
    schema: {
      example: {},
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  async updateBookList(
    @Optional()
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 5000 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png)/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File | undefined,
    @User() user: any,
    @Body() data: BooklistUpdateDto,
    @Param('id') id: string,
  ) {
    try {
      if (file) {
        const file_name = id + '.' + Date.now();
        const res = await this.uploadService.saveFileOnS3(
          file,
          'booklist',
          file_name,
        );
        if (res.status) {
          data.image = res.file_url;
        } else {
          throw new HttpException(
            { error: { code: 'FORBIDDEN' } },
            HttpStatus.FORBIDDEN,
          );
        }
      }
      return await this.booklistService.updateOne(id, user.uid, data);
    } catch (error) {
      this.loggerService.error('BooklistUpdate', error);
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your booklist',
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
  @ApiResponse({
    status: 404,
    description: 'The booklist not exist',
    schema: {
      example: {
        error: {
          code: 'NOT_FOUND',
        },
      },
    },
  })
  async getOneBookList(@User() user: any, @Param('id') id: string) {
    return this.booklistService.getOne(id, user.uid);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your booklists',
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
  @ApiResponse({
    status: 404,
    description: 'The booklist not exist',
    schema: {
      example: {
        error: {
          code: 'NOT_FOUND',
        },
      },
    },
  })
  async getBookListForMe(
    @User() user: any,
    @Query('title') title?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('include') include?: string,
  ) {
    if (include == 'books') {
      return this.booklistService.getBooks(user.uid);
    } else {
      return this.booklistService.getList(user.uid, title, page, limit);
    }
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to delete',
  })
  async deleteOneBookList(@User() user: any, @Param('id') id: string) {
    return this.booklistService.deleteOne(id, user.uid);
  }

  @Post(':booklistid/add-remove-book')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Action is done successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not permission for this action',
  })
  async addOrRemoveBook(
    @User() user: any,
    @Param('booklistid') booklistid: string,
    @Body() data: any,
  ) {
    return this.booklistService.addOrRemoveBook(
      user.uid,
      booklistid,
      data.bookId,
    );
  }

  @Post(':booklistid/save')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Action is done successfully',
  })
  @HttpCode(204)
  async saveBooklist(
    @User() user: any,
    @Param('booklistid') booklistid: string,
  ) {
    return this.booklistService.saveOne(user.uid, booklistid);
  }

  @Post(':booklistid/invite-collaborators')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Invitation sent successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You are not onwer of this booklist',
  })
  async inviteCollaborators(
    @User() user: any,
    @Param('booklistid') booklistid: string,
    @Body() data: any,
  ) {
    return this.booklistService.inviteCollaborators(
      user.uid,
      booklistid,
      data.collaborators,
    );
  }

  @Post(':booklistid/accept-collaborator')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Action is done successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not permission for this action',
  })
  async acceptCollaborator(
    @User() user: any,
    @Param('booklistid') booklistid: string,
    @Body() data: any,
  ) {
    return this.booklistService.acceptCollaborator(
      user.uid,
      booklistid,
      data.status,
    );
  }
}
