import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Length,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ONBOARDING_STATUS } from 'src/enum';
import { Transform } from 'class-transformer';
import { IsGeneralString } from 'src/validators/validator.string';

export class UserDto {
  @ApiProperty({ description: 'biography', minLength: 0, maxLength: 1500 })
  @IsString()
  @Length(0, 1500, {
    message: 'biography must be exactly 0~1500 characters long',
  })
  biography: string;

  @ApiProperty({ description: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'firebaseId' })
  @IsString()
  @IsNotEmpty()
  firebaseId: string;

  @ApiProperty({ description: 'firstName', minLength: 1, maxLength: 30 })
  @IsString()
  @Length(1, 30, {
    message: 'firstName must be exactly 1~30 characters long',
  })
  firstName: string;

  @ApiProperty({ description: 'invitationsRemainingCount' })
  @IsNumber()
  @IsNotEmpty()
  invitationsRemainingCount: number;

  @ApiProperty({ description: 'isPublic' })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @ApiProperty({ description: 'lastName', minLength: 1, maxLength: 30 })
  @IsString()
  @Length(1, 30, {
    message: 'lastName must be exactly 1~30 characters long',
  })
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

  @ApiProperty({ description: 'username', minLength: 0, maxLength: 50 })
  @IsString()
  @Length(0, 50, {
    message: 'lastName must be exactly 0~50 characters long',
  })
  username: string;

  @ApiProperty({ description: 'backgroundColor', minLength: 7, maxLength: 9 })
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
  @ApiProperty({ description: 'biography', minLength: 0, maxLength: 1500 })
  @IsGeneralString()
  @IsOptional()
  @Length(0, 1500, {
    message: 'biography must be exactly 0~1500 characters long',
  })
  biography?: string;

  @ApiProperty({ description: 'email' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'firstName', minLength: 1, maxLength: 30 })
  @IsString()
  @IsOptional()
  @Length(1, 30, {
    message: 'firstName must be exactly 1~30 characters long',
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message:
      'username must contain only alphanumeric characters (letters and numbers)',
  })
  @Transform(({ value }) => value?.replace(/\s+/g, ''), { toClassOnly: true })
  firstName?: string;

  @ApiProperty({ description: 'lastName', minLength: 1, maxLength: 30 })
  @IsString()
  @IsOptional()
  @Length(1, 30, {
    message: 'lastName must be exactly 1~30 characters long',
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message:
      'username must contain only alphanumeric characters (letters and numbers)',
  })
  @Transform(({ value }) => value?.replace(/\s+/g, ''), { toClassOnly: true })
  lastName?: string;

  @ApiProperty({ description: 'locale' })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiProperty({ description: 'photo' })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiProperty({ description: 'username', minLength: 0, maxLength: 50 })
  @IsString()
  @IsOptional()
  @Length(0, 50, {
    message: 'lastName must be exactly 0~50 characters long',
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message:
      'username must contain only alphanumeric characters (letters and numbers)',
  })
  @Transform(({ value }) => value?.replace(/\s+/g, ''), { toClassOnly: true })
  username?: string;

  @ApiProperty({ description: 'backgroundColor' })
  @IsString()
  @IsOptional()
  @Length(7, 9, {
    message:
      'backgroundColor must be hex value and exactly 7~9 characters long',
  })
  @Matches(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: 'backgroundColor must be a valid hex color',
  })
  backgroundColor?: string;

  @ApiProperty({ description: 'onboardingStatus' })
  @IsEnum(ONBOARDING_STATUS)
  @IsOptional()
  onboardingStatus?: ONBOARDING_STATUS;
}
