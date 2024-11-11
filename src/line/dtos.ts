import { IsString, IsNumber, IsOptional } from 'class-validator';
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

  @ApiProperty({ description: 'rate' })
  @IsNumber()
  @IsOptional()
  rating: number;

  @ApiProperty({ description: 'line' })
  @IsString()
  @IsOptional()
  line: string;

  @ApiProperty({ description: 'book' })
  @IsString()
  book: string;
}
