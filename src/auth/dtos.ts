import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'firebaseToken' })
  @IsString()
  @IsNotEmpty()
  firebaseToken: string;
}
