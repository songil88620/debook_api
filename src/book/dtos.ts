import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookCreateDto {
  @ApiProperty({ description: 'title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'summary' })
  @IsString()
  @IsOptional()
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
