import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Schema } from '@infra/database/schema';

export const DATABASE_PROVIDER = 'DATABASE_PROVIDER';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_PROVIDER,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pool = new Pool({
          host: configService.getOrThrow<string>('POSTGRES_HOST'),
          port: configService.getOrThrow<number>('POSTGRES_PORT'),
          database: configService.getOrThrow<string>('POSTGRES_DB'),
          user: configService.getOrThrow<string>('POSTGRES_USER'),
          password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
          ssl: configService.getOrThrow<boolean>('POSTGRES_SSL_ENABLED')
            ? { rejectUnauthorized: false }
            : false,
        });

        return drizzle({
          client: pool,
          casing: 'snake_case',
        }) as NodePgDatabase<Schema>;
      },
    },
  ],
  exports: [DATABASE_PROVIDER],
})
export class DatabaseModule {}
