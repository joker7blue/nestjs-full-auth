import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDTO {
  @IsEmail()
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  password: string;
}
