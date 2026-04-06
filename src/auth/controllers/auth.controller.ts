import { CurrentUser, CustomApiCreatedResponse, CustomApiResponse } from '@shared/decorators';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';

import { AuthService } from '../services/auth.service';
import { SignInDTO, SignupDTO } from '../dto';
import { AuthGuard, GoogleAuthGuard } from '@/shared/guards';
import { ApiBody, ApiCookieAuth, ApiExcludeEndpoint, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { User } from '../models/user.model';
import { RegisterService } from '../services/resgister.service';
import { TokenResponse } from '../models/token.model';
import { EmailVerificationService } from '../services/email-verification.service';
import { PasswordService } from '../services/password.service';
import { ResetPasswordDTO } from '../dto/reset-password.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerService: RegisterService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordService: PasswordService,
  ) {}

  @Post('register')
  @CustomApiCreatedResponse(User)
  async register(@Body(new ValidationPipe()) dto: SignupDTO): Promise<User> {
    return await this.registerService.signUp(dto);
  }

  @Post('login')
  @CustomApiResponse(TokenResponse)
  async login(
    @Body(new ValidationPipe()) dto: SignInDTO,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const tokens = await this.authService.signIn(dto, req);

    res.cookie('bg-acc-refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only https in prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/', // Make cookie available for all endpoints
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return tokens;
  }

  @Get('google-redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req, @Res() res: Response) {
    return this.authService.googleLogin(req, res);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @CustomApiResponse(User)
  async getCurrentUser(@CurrentUser('id') userId: number): Promise<User> {
    return await this.authService.me(userId);
  }

  // send email verification
  @Post('send-verification-email')
  @ApiBody({ schema: { properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @CustomApiResponse(String)
  async sendVerificationEmail(@Body('email') email: string) {
    return await this.emailVerificationService.sendEmailVerification(email);
  }

  // verify email
  @Post('verify-email')
  @CustomApiResponse(User)
  async verifyEmail(@Body('token') token: string): Promise<User> {
    return await this.emailVerificationService.verifyEmailToken(token);
  }

  // reset password
  @Post('send-reset-password-code')
  @ApiBody({ schema: { properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @CustomApiResponse(String)
  async sendResetPasswordCode(@Body('email') email: string): Promise<string> {
    return await this.passwordService.sendResetPasswordCode(email);
  }

  @Post('reset-password')
  @CustomApiResponse(User)
  @ApiBody({ type: ResetPasswordDTO })
  async resetPassword(@Body(new ValidationPipe()) dto: ResetPasswordDTO): Promise<User> {
    return await this.passwordService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  // refresh token
  // Endpoint to refresh JWT tokens using a refresh token
  // The refresh token can be sent via HttpOnly cookie or in the request header
  @Post('refresh-token')
  @ApiHeaders([{ name: 'x-bg-acc-refresh_token', required: false, description: 'Refresh Token' }])
  @ApiCookieAuth('bg-acc-refresh_token')
  // @UseGuards() // Add any necessary guards here
  // e.g., JwtRefreshGuard if you have a specific guard for refresh tokens
  @CustomApiResponse(TokenResponse)
  async refreshToken(@Req() req: ExpressRequest): Promise<TokenResponse> {
        console.log('🚀 ~ AuthController ~ login ~ process.env.NODE_ENV:', process.env.NODE_ENV);

    return await this.authService.refreshToken(req);
  }

  // logout
  @Post('logout')
  @ApiCookieAuth('bg-acc-refresh_token')
  @CustomApiResponse(String)
  @UseGuards(AuthGuard)
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser('id') userId: number,
  ): Promise<string> {
    const loggedout = await this.authService.logout(userId, req);

    if (!loggedout) {
      throw new Error('Logout failed');
    }

    res.clearCookie('bg-acc-refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/', // Match the path used when setting the cookie
      maxAge: 0, // expire immediately
    });

    return 'Logged out successfully';
  }
}
