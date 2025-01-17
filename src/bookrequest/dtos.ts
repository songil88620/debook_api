import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/user.entity';

export class RequesterCreateDto {
  @ApiProperty({ description: 'title', minLength: 5, maxLength: 100 })
  @IsString()
  @IsOptional()
  @Length(5, 100, {
    message: 'title must be exactly 5~100 characters long',
  })
  title?: string;

  @ApiProperty({ description: 'description', minLength: 0, maxLength: 1500 })
  @IsString()
  @IsOptional()
  @Length(0, 1500, {
    message: 'description must be exactly 0~1500 characters long',
  })
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
