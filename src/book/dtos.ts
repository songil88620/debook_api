import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookCreateDto {
  @ApiProperty({ description: 'title', minLength: 5, maxLength: 500 })
  @IsString()
  @IsOptional()
  @Length(5, 500, {
    message: 'title must be exactly 5~500 characters long',
  })
  title?: string;

  @ApiProperty({ description: 'summary', minLength: 0, maxLength: 1500 })
  @IsString()
  @IsOptional()
  @Length(0, 1500, {
    message: 'summary must be exactly 0~1500 characters long',
  })
  summary?: string;

  @ApiProperty({ description: 'image' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'file' })
  @IsString()
  @IsOptional()
  file?: string;

  @ApiProperty({ description: 'tags' })
  @IsString()
  @IsOptional()
  tags?: string;
}
