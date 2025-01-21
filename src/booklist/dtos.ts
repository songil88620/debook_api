import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsGeneralString } from 'src/validators/validator.string';

export class BooklistCreateDto {
  @ApiProperty({ description: 'title', minLength: 5, maxLength: 100 })
  @IsGeneralString()
  @IsOptional()
  @Length(5, 100)
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
  @ApiProperty({ description: 'title', minLength: 5, maxLength: 100 })
  @IsGeneralString()
  @IsOptional()
  @Length(5, 100, {
    message: 'title must be exactly 5~100 characters long',
  })
  title?: string;

  @ApiProperty({ description: 'summary', minLength: 0, maxLength: 1500 })
  @IsGeneralString()
  @IsOptional()
  @Length(0, 1500, {
    message: 'summary must be exactly 0~1500 characters long',
  })
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
