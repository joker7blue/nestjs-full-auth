import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleSsoService } from '@schema/apps-schema/sso/drizzle-sso.service';
import { ChapmailService } from '@shared/services';
import { UsersService } from '../../users/users.service';
import { User } from '../models/user.model';

@Injectable()
export class EmailVerificationService {
  private logger = new Logger(EmailVerificationService.name);

  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private chapmailService: ChapmailService,
    private drizzleSsoService: DrizzleSsoService,
  ) {}

  get db() {
    return this.drizzleSsoService.getDatabase();
  }

  async sendEmailVerification(email: string): Promise<string> {
    const payload = { email };

    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('This email does not exist');
    }

    if (user.emailVerified) {
      throw new ConflictException('This email is already verified');
    }

    const emailVerificationToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const emailVerificationLink = `${process.env.SSO_FRONTEND_HOST}/verify?email=${email}&token=${emailVerificationToken}`;

    const result = await this.chapmailService.sendMail({
      senderName: 'BoomgTech',
      from: process.env.NO_REPLY_EMAIL_ADDRESS,
      to: [email],
      subject: 'Email Verification',
      templateName: 'boomgtech-email-verification',
      templateData: {
        email_verification_link: emailVerificationLink,
        user_email: email,
      },
      //attachments: [getFileAttachment('boomgtech-logo.png')],
    });

    return result.data.messageId;
  }

  async verifyEmailToken(token: string): Promise<User> {
    if (!token)
      throw new UnprocessableEntityException('provide a string token to verify your email address');

    const data = this.jwtService.verify(token);

    this.logger.debug('data ====>><>> ', data);

    if (!data) {
      throw new UnauthorizedException('The token is not valid');
    }

    const { email } = data as { email: string };

    const user = await this.userService.findOne({ email });

    await this.userService.update(user.id, { emailVerified: true });

    return user;
  }
}
