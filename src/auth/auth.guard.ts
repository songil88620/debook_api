import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      // If the route is public, allow access without checking token
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new HttpException(
        { error: { code: 'UNAUTHORIZED' } },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const decodedToken = await this.authService.verifyToken(token);
      if (request?.user || decodedToken.status == true) {
        request.user = decodedToken.data;
        return true;
      } else {
        if (decodedToken.data == 'auth/id-token-expired') {
          throw new HttpException({ error: { code: 'TOKEN_EXPIRED' } }, 498);
        } else {
          throw new HttpException(
            { error: { code: 'UNAUTHORIZED' } },
            HttpStatus.UNAUTHORIZED,
          );
        }
      }
    } catch (error) {
      throw new HttpException({ error: { code: 'TOKEN_EXPIRED' } }, 498);
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return null;
  }
}
