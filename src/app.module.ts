import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const nodeEnv = process.env.NODE_ENV || 'development';

        // Path to root directory from packages/shared/src
        const rootPath =
          nodeEnv !== 'production'
            ? path.resolve(__dirname, '..', '..', '..')
            : process.cwd();

        // Construct env file paths in priority order
        return [
          path.join(rootPath, `.env.local`),
          path.join(rootPath, '.env.staging'),
          path.join(rootPath, '.env.production'),
        ];
      })(),
    }),
    DrizzleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
