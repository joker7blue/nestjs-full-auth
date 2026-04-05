import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export function createDrizzleProvider(
  providerName: string,
  schema: Record<string, any>,
) {
  return {
    provide: providerName,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const connectionString = configService.get<string>('DATABASE_URL');
      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  };
}

// Default provider name constant
export const DRIZZLE_ASYNC_PROVIDER = 'DrizzleAsyncProvider';
