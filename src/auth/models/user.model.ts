import { ApiProperty } from '@nestjs/swagger';
import { AuditTimestampModel } from '@shared/models';

export class User extends AuditTimestampModel {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  emailVerified?: boolean;

  @ApiProperty()
  phoneVerified?: boolean;

  @ApiProperty()
  twoFactorEnabled?: boolean;

  @ApiProperty()
  isActive?: boolean;

  // for role
  @ApiProperty()
  roles?: string[];

  // for user profile
  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;
}
