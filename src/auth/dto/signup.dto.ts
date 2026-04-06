import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SignupDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  lastname: string;

  @IsEmail()
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  password: string;
}
