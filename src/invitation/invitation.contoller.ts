import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
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
  })
  async getInvitations(@User() user: any, @Query('type') type?: string) {
    if (type === 'target') {
      return this.invitationService.getInvitationsByPhoneNumber(
        user.phone_number,
      );
    } else {
      return this.invitationService.getInvitations(user.uid);
    }
  }

  @Get('/ranking')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The user has invited 0 or more users',
  })
  async getInvitationRank() {
    return await this.invitationService.getInvitationRank();
  }

  @Get(':invitationId')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description:
      'The user has an invitation asociated to the phone number inside',
  })
  async getOneInvitaion(@Param('invitationId') invitationId: string) {
    return this.invitationService.getOneInvitation(invitationId);
  }

  @Post(':invitationId/accept')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
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

  @Post(':invitationId/decline')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'The invitation was successfully declined',
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
  async declineInvitation(
    @User() user: any,
    @Param('invitationId') invitationId: string,
  ) {
    await this.invitationService.declineInvitationById(
      invitationId,
      user.uid,
      user.phone_number,
    );
  }
}
