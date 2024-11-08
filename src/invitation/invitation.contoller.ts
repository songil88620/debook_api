import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { InvitaionDto, InvitationCreateDto } from './dtos';
import { InvitationService } from './invitation.service';
import { User } from 'src/user/user.decorator';

@Controller('invitations')
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBody({ type: InvitationCreateDto })
  @ApiResponse({
    status: 200,
    description: 'The user has been invited successfully',
    type: InvitaionDto,
  })
  @ApiResponse({
    status: 401,
    description: 'The user access token is invalid or not present',
    schema: {
      example: {
        error: {
          code: 'UNAUTHORIZED',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'The user does not have available invitations',
    schema: {
      example: {
        error: {
          code: 'NO_INVITATIONS_AVAILABLE',
          data: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'The phone number has another pending invitation',
    schema: {
      example: {
        error: {
          code: 'PHONE_NUMBER_ALREADY_INVITED',
          data: null,
        },
      },
    },
  })
  async sendInvitation(
    @User() user: any,
    @Body() invitationCreateDto: InvitationCreateDto,
  ) {
    return await this.invitationService.sendInvitation(
      user.uid,
      invitationCreateDto.phoneNumber,
    );
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The user has invited 0 or more users',
    schema: {
      example: {
        invitations: [
          {
            id: 'f72e475d-....-....-....-e568bee612d4',
            inviterId: 'YMWd8.......q3SbEVZDs13',
            inviteePhoneNumber: '+9615....323',
            status: 'accepted',
            created: '2024-10-29T00:48:07.368Z',
            invitee: {
              biography: null,
              firebaseId: 'YMWd8uk.........EVZDs14',
              firstName: 'firstName',
              lastName: null,
              savedBooksCount: 0,
            },
            follow: null,
            currentTime: '2024-10-29T16:19:01.015Z',
          },
        ],
      },
    },
  })
  async getInvitaion(@User() user: any) {
    return this.invitationService.getInvitations(user.uid);
  }

  @Get('/rank')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The user has invited 0 or more users',
  })
  async getInvitaionRank() {
    return await this.invitationService.getInvitationRank();
  }

  @Get(':invitationId')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description:
      'The user has an invitation asociated to the phone number inside',
    schema: {
      example: {
        invitation: {
          id: 'f72e475d-....-.....-e568bee612d4',
          status: 'accepted',
          created: '2024-10-29T00:48:07.368Z',
          inviter: {
            firebaseId: 'YMWd8.....VZDs13',
            firstName: 'firstName',
            lastName: 'lastName',
          },
        },
      },
    },
  })
  async getOneInvitaion(@Param('invitationId') invitationId: string) {
    return this.invitationService.getOneInvitation(invitationId);
  }

  @Post(':invitationId/accept')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'The invitation was successfully accepted',
  })
  @ApiResponse({
    status: 400,
    description: 'The user access token is invalid or not present',
    schema: {
      example: {
        error: {
          code: 'INVITATION_EXPIRED',
          data: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'The invitation does not exist',
    schema: {
      example: {
        error: {
          code: 'NOT_FOUND',
          data: null,
        },
      },
    },
  })
  async acceptInvitation(
    @User() user: any,
    @Param('invitationId') invitationId: string,
  ) {
    return await this.invitationService.acceptInvitationById(
      invitationId,
      user.uid,
      user.phone_number,
    );
  }
}
