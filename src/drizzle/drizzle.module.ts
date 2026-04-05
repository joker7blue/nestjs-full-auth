import { Global, Module } from '@nestjs/common';
import * as appSchema from './schema';
import { DrizzleService } from './drizzle.service';
import { DrizzleBaseModule } from './drizzle-base.module';

@Global()
@Module({
  imports: [
    DrizzleBaseModule.forApp({
      schema: appSchema,
      providerName: 'DrizzleAsyncProvider',
    }),
  ],
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
