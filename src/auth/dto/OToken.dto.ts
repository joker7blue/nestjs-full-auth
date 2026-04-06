import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OTokenDTO {
  @IsString()
  @ApiProperty({ required: true })
  code: string;

  @IsString()
  @ApiProperty({ required: true })
  clientId: string;

  /* @IsString()
  @ApiProperty({ required: true })
  clientSecret: string; */

  @IsString()
  @ApiProperty({ required: true })
  codeVerifier: string;
}
