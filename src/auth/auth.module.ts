import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { OAuthController } from './controllers/oauth.controller';
import { SessionsController } from './controllers/sessions.controller';
import { UsersService } from '../users/users.service';
import { ChapmailService, IpinfoService } from '@shared/services';
import { OAuthService } from './services/oauth.service';
import { AuthUtilsService } from './services/auth-utils.service';
import { PasswordService } from './services/password.service';
import { RegisterService } from './services/resgister.service';
import { EmailVerificationService } from './services/email-verification.service';
import { SessionsService } from './services/sessions.service';

@Module({
  imports: [
    /* PassportModule, */
    JwtModule.register({
      secret: process.env.SSO_JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, OAuthController, SessionsController],
  providers: [
    AuthUtilsService,
    RegisterService,
    EmailVerificationService,
    PasswordService,
    AuthService,
    OAuthService,
    SessionsService,
    UsersService,
    ChapmailService,
    IpinfoService,
  ],
})
export class AuthModule {}
