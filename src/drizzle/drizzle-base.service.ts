import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

@Injectable()
export abstract class DrizzleServiceBase<T extends Record<string, any>> {
  constructor(protected readonly db: NodePgDatabase<T>) {}

  async migrate(migrationsFolder: string) {
    await migrate(this.db, { migrationsFolder });
  }

  getDatabase() {
    return this.db;
  }
}
