import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({ required: true })
  accessToken: string;

  @ApiProperty({ required: true })
  refreshToken: string;
}
