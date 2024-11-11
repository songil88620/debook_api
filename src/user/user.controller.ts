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
  @ApiResponse({
    status: 200,
    description: 'The user has been read successfully',
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
  async me(@User() user: any) {
    return await this.userService.findUserByFirebaseId(user.uid);
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
  @UseGuards(FirebaseAuthGuard)
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
    try {
      const uid = user.uid;
      if (id != uid) {
        throw new HttpException(
          { error: { code: 'FORBIDDEN' } },
          HttpStatus.FORBIDDEN,
        );
      }
      if (file) {
        const res = await this.uploadService.saveFileOnS3(file, 'avatar', uid);
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
    } catch (e) {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
