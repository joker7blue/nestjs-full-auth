import { DrizzleService } from '@/drizzle/drizzle.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { UsersService } from '../../users/users.service';
import { ChapmailService } from '@/shared/services';
import { codeTokens, sessions, UserInsert, users } from '@/schema';
import { and, eq } from 'drizzle-orm';
import { isAfter } from 'date-fns';

@Injectable()
export class PasswordService {
  private logger = new Logger(PasswordService.name);

  constructor(
    private userService: UsersService,
    private chapmailService: ChapmailService,
    private drizzleService: DrizzleService,
  ) {}

  get db() {
    return this.drizzleService.getDatabase();
  }

  async updatePassword(
    currentUser: Partial<UserInsert>,
    currentPassword: string,
    newPassword,
  ): Promise<User> {
    const user = await this.userService.findOne({ id: currentUser.id });

    const val = bcrypt.compareSync(currentPassword, user.password);

    if (!val) {
      throw new UnauthorizedException('Something went wront with you current password');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userService.update(user.id, { password: hashedPassword });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async sendResetPasswordCode(email: string): Promise<string> {
    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('This email does not exits');
    }

    const resetPasswordCode = this.generateRandom6DigitCode();

    const [codeSave] = await this.db
      .insert(codeTokens)
      .values({
        userId: user.id,
        codeOrToken: resetPasswordCode,
        type: 'reset_password',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      })
      .returning();

    if (!codeSave) {
      throw new BadRequestException('Error generating reset password code');
    }

    try {
      const result = await this.chapmailService.sendMail({
        from: process.env.NO_REPLY_EMAIL_ADDRESS,
        senderName: 'BoomgTech',
        to: [email],
        subject: 'Reset Password',
        templateName: 'boomgtech-password-reset-code',
        templateData: {
          reset_code: resetPasswordCode,
        },
        // attachments: [getFileAttachment('chapmail-logo.png')],
      });

      return result.data.messageId;
    } catch (error) {
      throw new Error(error);
    }
  }

  async resetPassword(email: string, code: string, password: string): Promise<User> {
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('This email does not exits');
    }

    const [codeToken] = await this.db
      .select()
      .from(codeTokens)
      .where(
        and(
          eq(codeTokens.userId, user.id),
          eq(codeTokens.codeOrToken, code),
          eq(codeTokens.type, 'reset_password'),
        ),
      )
      .limit(1);

    if (!codeToken) {
      throw new UnauthorizedException('The code is not valid');
    }

    // Check if the code is expired
    if (isAfter(new Date(), codeToken.expiresAt)) {
      // Invalidate the expired code
      await this.db.delete(codeTokens).where(eq(codeTokens.id, codeToken.id)).returning();
      throw new UnprocessableEntityException('The code has expired');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // transaction to update password and delete the used code
    const result = await this.db.transaction(async (tx) => {
      const [userUpdated] = await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id))
        .returning();

      // Remove all sessions or tokens of the user
      await tx.delete(codeTokens).where(eq(codeTokens.userId, user.id)).returning();
      await tx.delete(sessions).where(eq(sessions.userId, user.id)).returning();

      return userUpdated;
    });

    if (!result) {
      throw new BadRequestException('Error to update password');
    }

    return { id: user.id, email: user.email };
  }

  generateRandom6DigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
