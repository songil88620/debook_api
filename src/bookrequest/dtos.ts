import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/user.entity';

export class RequesterCreateDto {
  @ApiProperty({ description: 'title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'authorName' })
  @IsString()
  @IsOptional()
  authorName?: string;

  @ApiProperty({ description: 'fileUrl' })
  @IsString()
  @IsOptional()
  file?: string;

  @ApiProperty({ description: 'requester' })
  @IsOptional()
  requester: UserEntity | null;
}
