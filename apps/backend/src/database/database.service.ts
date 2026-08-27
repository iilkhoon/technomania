import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.createPool();
  }

  private createPool() {
    const connectionString = this.configService.get<string>('DATABASE_URL');
    this.pool = new Pool({
      connectionString,
      ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : false,
      max: 35,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    // Handle pool errors — reconnect automatically
    this.pool.on('error', (err) => {
      this.logger.error('DB pool error, recreating pool:', err.message);
      setTimeout(() => this.createPool(), 3000);
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      return await this.pool.query<T>(text, params);
    } catch (err: any) {
      // On auth/connection errors, recreate the pool and retry once
      if (err.code === '28P01' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.message?.includes('pool') || err.message?.includes('terminated')) {
        this.logger.warn('DB connection lost, recreating pool and retrying...');
        this.createPool();
        await new Promise(r => setTimeout(r, 1000));
        return this.pool.query<T>(text, params);
      }
      throw err;
    }
  }

  async executeTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transaction rolled back due to error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
