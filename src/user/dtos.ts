import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'biography' })
  @IsString()
  biography: string;

  @ApiProperty({ description: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'firebaseId' })
  @IsString()
  @IsNotEmpty()
  firebaseId: string;

  @ApiProperty({ description: 'firstName' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'followersCount' })
  @IsNumber()
  @IsNotEmpty()
  followersCount: number;

  @ApiProperty({ description: 'invitationsRemainingCount' })
  @IsNumber()
  @IsNotEmpty()
  invitationsRemainingCount: number;

  @ApiProperty({ description: 'isPublic' })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @ApiProperty({ description: 'lastName' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'locale' })
  @IsString()
  locale: string;

  @ApiProperty({ description: 'phoneNumber' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'photo' })
  @IsString()
  photo: string;

  @ApiProperty({ description: 'role' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'username' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'backgroundColor' })
  @IsString()
  @IsNotEmpty()
  @Length(7, 9, {
    message: 'backgroundColor must be exactly 7~9 characters long',
  })
  backgroundColor: string;

  @ApiProperty({ description: 'emailVerified' })
  @IsBoolean()
  @IsNotEmpty()
  emailVerified: boolean;

  @ApiProperty({ description: 'savedBooksCount' })
  @IsNumber()
  @IsNotEmpty()
  savedBooksCount: number;
}

export class UserCreateDto {
  @ApiProperty({ description: 'firebaseId' })
  @IsString()
  @IsNotEmpty()
  firebaseId: string;

  @ApiProperty({ description: 'phoneNumber' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class UserUpdateDto {
  @ApiProperty({ description: 'biography' })
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiProperty({ description: 'email' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'firstName' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'lastName' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'locale' })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiProperty({ description: 'photo' })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiProperty({ description: 'username' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'backgroundColor' })
  @IsString()
  @IsOptional()
  @Length(7, 9, {
    message:
      'backgroundColor must be hex value and exactly 7~9 characters long',
  })
  backgroundColor?: string;
}
