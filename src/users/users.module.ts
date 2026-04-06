import { Module } from '@nestjs/common';
// import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { DrizzleModule } from '@/drizzle';

@Module({
  imports: [DrizzleModule],
  controllers: [],
  providers: [UsersService],
})
export class UsersModule {}
