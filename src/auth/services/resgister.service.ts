import { ConflictException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SignupDTO } from '../dto';
import { User } from '../models/user.model';
import { UsersService } from '../../users/users.service';
import { ChapmailService } from '@shared/services';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class RegisterService {
  private logger = new Logger(RegisterService.name);

  constructor(
    private userService: UsersService,
    private chapmailService: ChapmailService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  async signUp(input: SignupDTO): Promise<User> {
    const { email, password } = input;
    const user = await this.userService.findOne({ email });
    if (user) {
      throw new ConflictException('a user with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userCreated = await this.userService.create({
      email,
      password: hashedPassword,
      firstname: input.firstname,
      lastname: input.lastname,
    });

    if (!userCreated) {
      throw new ConflictException('Error creating user');
    }

    // Send welcome email
    this.chapmailService
      .sendMail({
        senderName: 'BoomgTech',
        from: process.env.NO_REPLY_EMAIL_ADDRESS,
        to: [email],
        subject: 'Welcome to BoomgTech',
        templateName: 'boomgtech-welcome',
        templateData: {
          user_email: input.email,
          get_started_url: `${process.env.SSO_FRONTEND_HOST}`,
        },
        // attachments: [getFileAttachment('boomgtech-logo.png')],
      })
      .then((m) => {
        this.logger.log('Welcome email sent successfully', m.data);
      })
      .catch((error) => {
        this.logger.error('Error sending welcome email:', error.message, error.stack);
      });

    // Send email verification
    this.emailVerificationService
      .sendEmailVerification(userCreated.email)
      .then(() => {
        this.logger.log(`Verification email sent to ${userCreated.email}`);
      })
      .catch((error) => {
        this.logger.error('Error sending verification email:', error.message, error.stack);
      });

    return {
      id: userCreated.id,
      email: userCreated.email,
    };
  }
}
