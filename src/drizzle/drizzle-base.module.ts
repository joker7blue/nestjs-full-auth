import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  createDrizzleProvider,
  DRIZZLE_ASYNC_PROVIDER,
} from './drizzle.provider';

export interface DrizzleModuleOptions {
  schema: Record<string, any>;
  providerName?: string;
  migrationsFolder?: string;
}

@Module({})
export class DrizzleBaseModule {
  static forApp(options: DrizzleModuleOptions): DynamicModule {
    const { schema, providerName = DRIZZLE_ASYNC_PROVIDER } = options;

    const drizzleProvider = createDrizzleProvider(providerName, schema);

    return {
      module: DrizzleBaseModule,
      imports: [ConfigModule],
      providers: [drizzleProvider],
      exports: [drizzleProvider],
      global: true,
    };
  }
}
