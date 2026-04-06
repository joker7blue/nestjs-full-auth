import { Request as ExpressRequest } from 'express';
import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { AuthUtilsService } from './auth-utils.service';
import { sessions, SessionSelect } from '@/schema';
import { and, eq } from 'drizzle-orm';
import { IpInfoResponse, IpinfoService } from '@/shared/services';
import { Session } from '../models/session.model';

@Injectable()
export class SessionsService {
  private logger = new Logger(SessionsService.name);

  constructor(
    private authUtilsService: AuthUtilsService,
    private drizzleService: DrizzleService,
    private ipinfoService: IpinfoService,
  ) {}

  private get db() {
    return this.drizzleService.getDatabase();
  }

  async saveUserSession(
    userId: number,
    refreshToken: string,
    req: ExpressRequest,
  ): Promise<{ session: SessionSelect; isNew: boolean }> {
    const ipAddress = this.authUtilsService.getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const XDeviceId = req.headers['x-device-id'] || '';

    this.logger.log(`Login attempt from IP: ${ipAddress}, User-Agent: ${userAgent}`);

    if (!XDeviceId) {
      throw new UnprocessableEntityException('Device ID is required');
    }

    let ipInfoDetails: IpInfoResponse | null = null;

    if (ipAddress) {
      try {
        ipInfoDetails = await this.ipinfoService.getIpInfo(ipAddress);
      } catch (error) {
        this.logger.debug('Error to get info ip details ', error);
      }
    }

    const parser = new UAParser(userAgent);
    const userAgentParsed = parser.getResult();

    // check if there is an existing session for the same device
    // if yes, return the existing session
    // if not, create a new session
    const [existingSession] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.deviceId, XDeviceId.toString())))
      .limit(1);

    const dataToSave = {
      refreshToken,
      ipAddress,
      deviceId: XDeviceId.toString(),

      // location details from ipinfo
      country: ipInfoDetails?.country,
      region: ipInfoDetails?.region,
      city: ipInfoDetails?.city,
      loc: ipInfoDetails?.loc,
      timezone: ipInfoDetails?.timezone,

      // user agent details
      userAgent,
      os: userAgentParsed.os.name,
      browser: userAgentParsed.browser.name,
      device: userAgentParsed.device.model || userAgentParsed.device.vendor,

      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // example: 30 days
    };

    if (existingSession) {
      // update the existing session with new refresh token and expiry date
      const [updatedSession] = await this.db
        .update(sessions)
        .set({
          ...dataToSave,
        })
        .where(eq(sessions.id, existingSession.id))
        .returning();

      return { session: updatedSession, isNew: false };
    } else {
      const [newSession] = await this.db
        .insert(sessions)
        .values({
          userId: userId,
          ...dataToSave,
        })
        .returning();

      return { session: newSession, isNew: true };
    }
  }

  async terminateUserSession(userId: number, req: ExpressRequest): Promise<boolean> {
    const XDeviceId = req.headers['x-device-id'] || '';

    if (!XDeviceId) {
      // throw new UnprocessableEntityException('Device ID is required to terminate session');
      const deleteResult = await this.db
        .delete(sessions)
        .where(and(eq(sessions.userId, userId)))
        .returning();

      return deleteResult.length > 0;
    }

    const deleteResult = await this.db
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.deviceId, XDeviceId.toString())))
      .returning();

    return deleteResult.length > 0;
  }

  async deleteSessionById(sessionId: number, userId: number): Promise<boolean> {
    const deleteResult = await this.db
      .delete(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
      .returning();

    return deleteResult.length > 0;
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    const userSessions = await this.db.select().from(sessions).where(eq(sessions.userId, userId));

    return userSessions;
  }
}
