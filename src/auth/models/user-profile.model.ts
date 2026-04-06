import { ApiProperty } from '@nestjs/swagger';

export class UserProfile {
  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  bio?: string;
}
