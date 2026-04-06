import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@shared/guards/auth.guard';
import { CurrentUser } from '@shared/decorators';
import { SessionsService } from '../services/sessions.service';
import { CustomApiResponse } from '@shared/decorators';
import { Session } from '../models/session.model';
import { is } from 'drizzle-orm';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(AuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('')
  @CustomApiResponse([Session])
  async getUserSessions(@CurrentUser() user: any): Promise<Session[]> {
    return await this.sessionsService.getUserSessions(user.id);
  }

  @Delete(':id')
  @CustomApiResponse(Boolean)
  async deleteSession(
    @Param('id') id: number,
    @CurrentUser('id') userId: number,
  ): Promise<boolean> {
    return await this.sessionsService.deleteSessionById(id, userId);
  }
}
