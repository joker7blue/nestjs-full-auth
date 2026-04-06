import { Request as ExpressRequest } from 'express';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/users.service';
import { SignInDTO } from '../dto';
import { SessionSelect, UserInsert, UserSelect } from '@schema/apps-schema/sso';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenResponse } from '../models/token.model';
import { JwtService } from '@nestjs/jwt';
import { ChapmailService } from '@shared/services';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthUtilsService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private chapmailService: ChapmailService,
  ) {}

  generateTokens(user: Partial<UserInsert>): TokenResponse {
    const payload = { email: user.email, userId: user.id };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '2m',
      }),
      refreshToken: crypto.randomUUID(),
    };
  }

  async validateUserEmailAndPassword(input: SignInDTO): Promise<UserSelect> {
    const { email, password } = input;
    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('email or password is incorrect');
    }
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) throw new UnauthorizedException('email or password is incorrect.');

    return user;
  }

  async sendNewSessionLoginEmail(
    session: SessionSelect,
    userEmail: string,
  ): Promise<
    AxiosResponse<
      {
        messageId: string;
      },
      any,
      {}
    >
  > {
    return await this.chapmailService.sendMail({
      senderName: 'BoomgTech',
      from: process.env.NO_REPLY_EMAIL_ADDRESS,
      to: [userEmail],
      subject: 'New Session Login Notification',
      templateName: 'boomgtech-new-session-login',
      templateData: {
        user_email: userEmail,
        login_time: new Date().toISOString(),
        timezone: session.timezone,
        city: session.city || 'Unknown',
        region: session.region || 'Unknown',
        country: session.country || 'Unknown',
        device: session.device || 'Unknown',
        browser: session.browser || 'Unknown',
        os: session.os || 'Unknown',
        ip_address: session.ipAddress || 'Unknown',
        secure_account_link: `${process.env.SSO_FRONTEND_HOST}`,
      },
    });
  }

  /**
   * Extract client IP address from request, handling proxies and load balancers
   */
  getClientIp(req: ExpressRequest): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      (req.headers['x-client-ip'] as string) ||
      (req.headers['x-forwarded'] as string) ||
      (req.headers['x-cluster-client-ip'] as string) ||
      (req.headers['forwarded-for'] as string) ||
      (req.headers['forwarded'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }
}
