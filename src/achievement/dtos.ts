import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AchievementDto {
  @ApiProperty({ description: 'id' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'invitations' })
  @IsString()
  @IsOptional()
  inviterId?: string;
}
