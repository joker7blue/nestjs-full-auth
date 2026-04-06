import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class OAuthorizeDTO {
  @IsEmail()
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @ApiProperty({ required: true })
  password: string;

  @IsString()
  @ApiProperty({ required: true })
  clientId: string;

  @IsString()
  @ApiProperty({ required: true })
  redirectUri: string;

  @IsString()
  @ApiProperty({ required: true })
  codeChallenge: string;
}
