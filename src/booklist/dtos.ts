import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BooklistCreateDto {
  @ApiProperty({ description: 'title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'book_ids' })
  @IsArray()
  @IsString({ each: true })
  bookIds?: string[];

  @ApiProperty({ description: 'public' })
  @IsBoolean()
  @IsOptional()
  public?: boolean;
}

export class BooklistUpdateDto {
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

  @ApiProperty({ description: 'public' })
  @IsBoolean()
  @IsOptional()
  public?: boolean;
}

export class BooklistBookUpdateDto {
  @ApiProperty({ description: 'bookid' })
  @IsString()
  bookid: string;

  @ApiProperty({ description: 'mode' })
  @IsBoolean()
  mode: boolean;
}

export class BookidDto {
  @ApiProperty({ description: 'bookid' })
  @IsString()
  bookId: string;
}

export class CollaboratorDto {
  @ApiProperty({ description: 'collaborators' })
  @IsArray()
  @IsString({ each: true })
  collaborators?: string[];
}

export class StatusDto {
  @ApiProperty({ description: 'status' })
  @IsBoolean()
  status: boolean;
}
