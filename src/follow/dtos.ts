import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/user.entity';
import { Type } from 'class-transformer';

export class FollowCreateDto {
  @ApiProperty({ description: 'inviter' })
  @IsNotEmpty()
  follower: UserEntity;

  @ApiProperty({ description: 'invitee' })
  @Type(() => UserEntity)
  @IsNotEmpty()
  followee: UserEntity;

  @ApiProperty({ description: 'status' })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
