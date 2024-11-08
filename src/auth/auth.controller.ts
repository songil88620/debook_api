import { Body, Controller, Inject, Post, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dtos';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserDto } from 'src/user/dtos';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}

  @Public()
  @ApiBody({ type: AuthDto })
  @ApiOperation({ summary: 'Verify the firebase token' })
  @ApiResponse({
    status: 200,
    description: 'The user has been authenticated successfully',
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
  @Post('firebase')
  verifyFirebaseToken(@Body() data: AuthDto) {
    return this.authService.verifyIdToken(data.firebaseToken);
  }

  // need to left for dev yet
  @Public()
  @Post('refresh')
  refreshToken(@Body() data: AuthDto) {
    return this.authService.refreshToken(data.firebaseToken);
  }
}
