import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as appSchema from './schema';
import { DrizzleServiceBase } from './drizzle-base.service';

@Injectable()
export class DrizzleSsoService extends DrizzleServiceBase<typeof appSchema> {
  constructor(
    @Inject('DrizzleAsyncProvider')
    db: NodePgDatabase<typeof appSchema>,
  ) {
    super(db);
  }

  override async migrate() {
    await super.migrate('src/app/database/migrations');
  }
}
