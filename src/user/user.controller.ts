import {
  Body,
  Controller,
  Get,
  HttpStatus,
  UseGuards,
  HttpException,
  Patch,
  UseInterceptors,
  Param,
  FileTypeValidator,
  ParseFilePipe,
  UploadedFile,
  Optional,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { UserDto, UserUpdateDto } from 'src/user/dtos';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { User } from './user.decorator';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => UploadService))
    private uploadService: UploadService,
  ) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async me(@User() user: any) {
    return await this.userService.getMe(user.uid);
  }

  @Get(':userId')
  @UseGuards(FirebaseAuthGuard)
  async getOneUser(@User() user: any, @Param('userId') userId: string) {
    return await this.userService.getOne(user.uid, userId);
  }

  @Get(':userId/booklists')
  @UseGuards(FirebaseAuthGuard)
  async getOneUserBooklists(
    @User() user: any,
    @Param('userId') userId: string,
  ) {
    return await this.userService.getOneUserBooklists(user.uid, userId);
  }

  @Get(':userId/lines')
  @UseGuards(FirebaseAuthGuard)
  async getOneUserLines(@User() user: any, @Param('userId') userId: string) {
    return await this.userService.getOneUserLines(user.uid, userId);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        backgroundColor: {
          type: 'string',
          nullable: true,
        },
        biography: {
          type: 'string',
          nullable: true,
        },
        email: {
          type: 'string',
          nullable: true,
        },
        firstName: {
          type: 'string',
          nullable: true,
        },
        lastName: {
          type: 'string',
          nullable: true,
        },
        locale: {
          type: 'string',
          nullable: true,
        },
        username: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been updated successfully',
    type: UserDto,
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
  @ApiResponse({
    status: 400,
    description: 'Email or username are already used.',
    schema: {
      example: {
        error: {
          code: 'BAD_REQUEST',
        },
      },
    },
  })
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async updateUser(
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
    @Param('id') id: string,
    @User() user: any,
    @Body() updateUserDto: UserUpdateDto,
  ) {
    const uid = user.uid;
    if (id != uid) {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
    const [valid_username, valid_email] = await Promise.all([
      this.userService.checkUsernameUnique(uid, updateUserDto.username),
      this.userService.checkEmailUnique(uid, updateUserDto.email),
    ]);
    if (!(valid_email && valid_username)) {
      if (!valid_email) {
        throw new HttpException(
          {
            error: {
              code: 'BAD_REQUEST',
              errorCode: 1,
              message: 'This email is already in use',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!valid_username) {
        throw new HttpException(
          {
            error: {
              code: 'BAD_REQUEST',
              errorCode: 2,
              message: 'This username is already in use',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (file) {
      const file_name = uid + '.' + Date.now();
      const res = await this.uploadService.saveFileOnS3(
        file,
        'avatar',
        file_name,
      );
      if (res.status) {
        updateUserDto.photo = res.file_url;
      } else {
        throw new HttpException(
          { error: { code: 'FORBIDDEN' } },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return await this.userService.update(uid, updateUserDto);
  }
}
