import { IsString, IsOptional, Length, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LINE_TYPE } from 'src/enum';
import { Column } from 'typeorm';
import { Type } from 'class-transformer';

export class LineCreateDto {
  @ApiProperty({ description: 'description', minLength: 0, maxLength: 1000 })
  @IsString()
  @IsOptional()
  @Length(0, 1000, {
    message: 'content must be exactly 0~1000 characters long',
  })
  description: string;

  @Column({ type: 'enum', enum: LINE_TYPE, default: LINE_TYPE.VIDEO })
  @IsOptional()
  type: LINE_TYPE;

  @ApiProperty({ description: 'book' })
  @IsString()
  book: string;

  @ApiProperty({ description: 'rating', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
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
  @ApiProperty({ description: 'content', minLength: 1, maxLength: 300 })
  @IsString()
  @Length(1, 300, {
    message: 'content must be exactly 1~300 characters long',
  })
  content: string;
}
