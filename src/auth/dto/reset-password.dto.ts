import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  newPassword: string;
}
