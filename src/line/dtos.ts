import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LINE_TYPE } from 'src/enum';
import { Column } from 'typeorm';

export class LineCreateDto {
  @ApiProperty({ description: 'description' })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ type: 'enum', enum: LINE_TYPE, default: LINE_TYPE.VIDEO })
  @IsOptional()
  type: LINE_TYPE;

  @ApiProperty({ description: 'book' })
  @IsString()
  book: string;

  @ApiProperty({ description: 'rating' })
  @IsOptional()
  rating: number;

  @ApiProperty({ description: 'file' })
  @IsString()
  @IsOptional()
  file: string;

  @ApiProperty({ description: 'thumbnail' })
  @IsString()
  @IsOptional()
  thumbnail: string;
}

export class ContentDto {
  @ApiProperty({ description: 'content' })
  @IsString()
  content: string;
}
