import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsOptional()
  emailVerified?: boolean;

  @ApiProperty()
  @IsOptional()
  password?: string;
}
