import { IsString, IsNotEmpty, IsPhoneNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/user.entity';
import { INVITATION_STATUS_TYPE } from 'src/enum';

export class InvitationCreateDto {
  @ApiProperty({ description: 'phoneNumber' })
  @IsPhoneNumber()
  phoneNumber: string;
}

export class InvitationAcceptDto {
  @ApiProperty({ description: 'invitationId' })
  @IsString()
  invitationId: string;
}

export class InvitaionDto {
  @ApiProperty({ description: 'id' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'inviterId' })
  inviter: UserEntity;

  @ApiProperty({ description: 'inviteeId' })
  invitee: UserEntity | null;

  @ApiProperty({ description: 'inviteePhoneNumber' })
  @IsPhoneNumber()
  inviteePhoneNumber: string;

  @ApiProperty({ description: 'status', enum: INVITATION_STATUS_TYPE })
  @IsEnum(INVITATION_STATUS_TYPE)
  status: INVITATION_STATUS_TYPE;
}
