import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { roles, userRoles, users } from '@/schema';
import { and, eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from '@/drizzle';
import { CurrentAuthUser } from '@/shared/models';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private DrizzleService: DrizzleService,
    private jwtService: JwtService,
  ) {}

  get ssoDb() {
    return this.DrizzleService.getDatabase();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization type');
    }

    try {
      // Verify and decode the JWT token
      const decoded = this.jwtService.verify(token);

      // Extract userWalletId from the token
      const accessToken = decoded.accessToken;
      const userId = decoded.userId;

      // Get user profile from database
      const user = await this.ssoDb.query.users.findFirst({
        with: {
          userRoles: {
            with: { role: true },
          },
        },
        columns: { password: false },
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new UnauthorizedException('User profile not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      const extractedRoles = user.userRoles.map((u) => u.role?.name).filter(Boolean);
      const { id, email, isActive } = user;

      // Attach user to request for use in resolvers/controllers
      request.user = { id, email, isActive, roles: extractedRoles } as CurrentAuthUser;

      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
        });
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          code: 'TOKEN_INVALID',
          message: 'Invalid access token',
        });
      }

      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException({
          code: 'TOKEN_NOT_ACTIVE',
          message: 'Token not active yet',
        });
      }

      // Generic fallback for any other errors
      throw new UnauthorizedException({
        code: 'TOKEN_VALIDATION_FAILED',
        message: 'Token validation failed',
      });
    }
  }

  /**
   * Extract request object from either GraphQL or REST context
   */
  private getRequest(context: ExecutionContext) {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      // GraphQL context
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;
    } else {
      // REST/HTTP context
      return context.switchToHttp().getRequest();
    }
  }
}
