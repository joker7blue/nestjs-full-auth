import {
  Injectable,
  UnprocessableEntityException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { UsersService } from '../../users/users.service';
import { SignInDTO } from '../dto';
import { sessions, users, UserSelect } from '@schema/apps-schema/sso';
import { User } from '../models/user.model';
import { and, eq } from 'drizzle-orm';
import { DrizzleSsoService } from '@schema/apps-schema/sso/drizzle-sso.service';
import { TokenResponse } from '../models/token.model';
import { isAfter } from 'date-fns';
import { AuthUtilsService } from './auth-utils.service';
import { SessionsService } from './sessions.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private authUtilsService: AuthUtilsService,
    private userService: UsersService,
    private sessionsService: SessionsService,
    private drizzleSsoService: DrizzleSsoService,
  ) {}

  get db() {
    return this.drizzleSsoService.getDatabase();
  }

  async signIn(input: SignInDTO, req: ExpressRequest): Promise<TokenResponse> {
    // Validate user credentials
    const user = await this.authUtilsService.validateUserEmailAndPassword(input);

    // check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Your account is inactive. Please contact support.');
    }

    // Generate JWT tokens
    const tokens = this.authUtilsService.generateTokens(user);

    // Create or return existing session
    const { session, isNew } = await this.sessionsService.saveUserSession(
      user.id,
      tokens.refreshToken,
      req,
    );

    if (!session) {
      throw new UnprocessableEntityException('Failed to create or retrieve user session');
    }

    if (isNew) {
      // Send notification email for new device login
      this.authUtilsService
        .sendNewSessionLoginEmail(session, user.email)
        .then((m) => {
          this.logger.log('New session login email sent successfully', m.data);
        })
        .catch((error) => {
          this.logger.error('Error sending new session login email:', error.message, error.stack);
        });
    }

    this.logger.log(`User ${user.email} logged in successfully.`);

    return tokens;
  }

  // login with google
  async googleLogin(req: any, response: Response) {
    if (!req.user) {
      return 'No user from google';
    }

    const email = req.user.email;
    let user = await this.userService.findOne({ email });

    if (!user) {
      user = await this.userService.create({
        email,
        emailVerified: true,
      });
    }

    const { accessToken, refreshToken } = this.authUtilsService.generateTokens(user);

    // Create or return existing session
    const session = await this.sessionsService.saveUserSession(user.id, refreshToken, req);

    if (!session) {
      throw new UnprocessableEntityException('Failed to create user session');
    }

    return response.redirect(
      `${process.env.FRONTEND_HOST}/auth/login?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );

    /* return {
      message: 'User information from google',
      user: req.user,
    }; */
  }

  // get current authenticated user
  async me(userId: number): Promise<User> {
    const user = await this.db.query.users.findFirst({
      with: {
        userProfile: {
          columns: { firstName: true, lastName: true },
        },
        userRoles: {
          with: { role: true },
        },
      },
      columns: { password: false },
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const extractedRoles = user.userRoles.map((u) => u.role.name);
    const { userRoles, userProfile, ...rest } = user;

    return {
      ...rest,
      roles: extractedRoles,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
    };
  }

  async refreshToken(req: ExpressRequest): Promise<TokenResponse> {
    // Debug logging
    this.logger.debug('All cookies:', req.cookies);
    this.logger.debug('All headers:', req.headers);

    const refreshToken =
      req.cookies['bg-acc-refresh_token'] || req.headers['x-bg-acc-refresh_token'];

    this.logger.debug('Extracted refresh token:', refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const [session] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.refreshToken, refreshToken)));

    if (!session) throw new Error('Invalid refresh token');

    // Check if session is expired
    if (isAfter(new Date(), session.expiresAt)) {
      // Optionally delete the expired session
      await this.db.delete(sessions).where(eq(sessions.id, session.id)).returning();
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token has expired, please log in again',
      });
    }

    const [user] = await this.db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user) throw new NotFoundException('User not found');

    // Generate new access token
    const newTokens = this.authUtilsService.generateTokens(user);

    // Optionally rotate the refresh token
    /* await this.db
      .update(sessions)
      .set({ refreshToken: newTokens.refreshToken })
      .where(eq(sessions.id, session.id)); */

    // We are not rotating refresh tokens for now, just return the same one
    return {
      accessToken: newTokens.accessToken,
      refreshToken,
    };
  }

  async logout(userId: number, req: ExpressRequest): Promise<boolean> {
    return await this.sessionsService.terminateUserSession(userId, req);
  }

  // transform user entity to user model
  transformToUserModel(user: UserSelect): User {
    const userModel = new User();
    userModel.id = Number(user.id);
    userModel.email = user.email;
    userModel.phoneNumber = user.phoneNumber;
    userModel.emailVerified = user.emailVerified;
    userModel.phoneVerified = user.phoneVerified;
    userModel.twoFactorEnabled = user.twoFactorEnabled;
    userModel.isActive = user.isActive;
    userModel.createdAt = user.createdAt;
    userModel.updatedAt = user.updatedAt;
    return userModel;
  }
}
