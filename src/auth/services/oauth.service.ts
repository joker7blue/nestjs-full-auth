import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { OAuthorizeDTO } from '../dto';
import { createHash } from 'crypto';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { authorize, users } from '@/schema';
import { and, eq } from 'drizzle-orm';
import { TokenResponse } from '../models/token.model';
import { AuthUtilsService } from './auth-utils.service';
import { SessionsService } from './sessions.service';

const REIRECT_URIs = ['http://localhost:3000/auth/callback'];

@Injectable()
export class OAuthService {
  private logger = new Logger(OAuthService.name);
  private authorizationCodes = new Map(); // Store codes temporarily

  constructor(
    private authUtilsService: AuthUtilsService,
    private drizzleService: DrizzleService,
    private sessionsService: SessionsService,
  ) {}

  get db() {
    return this.drizzleService.getDatabase();
  }

  async getAuthorizationCode(input: OAuthorizeDTO): Promise<string | null> {
    const { email, password, clientId, redirectUri, codeChallenge } = input;

    // Validate client ID and redirect URI
    if (!this.validateClient(clientId, redirectUri)) {
      throw new UnauthorizedException('Invalid client or redirect URI');
    }

    // Authenticate the user
    const user = await this.authUtilsService.validateUserEmailAndPassword({ email, password });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate authorization code
    const authorizationCode = await this.generateAuthorizationCode(user, clientId, codeChallenge);

    return authorizationCode;
  }

  async validateClient(clientId: string, redirectUri: string): Promise<boolean> {
    const [authorizedClient] = await this.db
      .select()
      .from(authorize)
      .where(and(eq(authorize.clientId, clientId)))
      .limit(1);

    if (!authorizedClient) return false;

    if (!authorizedClient.redirectUris.includes(redirectUri)) return false;

    return true;
  }

  async generateAuthorizationCode(
    user: any,
    clientId: string,
    codeChallenge: string,
  ): Promise<string> {
    const code = Math.random().toString(36).substring(2, 15); // Generate a random code
    this.authorizationCodes.set(code, {
      userId: user.id,
      clientId,
      codeChallenge,
    });
    return code;
  }

  async exchangeCodeForTokens(
    code: string,
    clientId: string,
    codeVerifier: string,
    req: ExpressRequest,
  ): Promise<TokenResponse> {
    const codeData = this.authorizationCodes.get(code);

    if (!codeData || codeData.clientId !== clientId) {
      throw new Error('Invalid code or client');
    }

    // Validate code verifier
    const hashedVerifier = createHash('sha256').update(codeVerifier).digest('base64url');
    const isVerified = codeData.codeChallenge === hashedVerifier;
    if (!isVerified) {
      throw new Error('Invalid code verifier');
    }

    // Remove code after use
    this.authorizationCodes.delete(code);

    // Find the user
    const [user] = await this.db.select().from(users).where(eq(users.id, codeData.userId)).limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate tokens
    const tokens = this.authUtilsService.generateTokens(user);

    // Extract IP address and user agent
    const ipAddress = this.authUtilsService.getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';

    // save refresh token in sessions table
    const { session, isNew } = await this.sessionsService.saveUserSession(
      codeData.userId,
      tokens.refreshToken,
      req,
    );

    if (!session) {
      throw new Error('Failed to create user session');
    }

    if (isNew) {
      // Send notification email for new device login
      this.authUtilsService
        .sendNewSessionLoginEmail(session, user.email)
        .then((m) => {
          this.logger.log('New session login email sent successfully', m);
        })
        .catch((error) => {
          this.logger.error('Error sending new session login email:', error.message, error.stack);
        });
    }

    return tokens;
  }
}
