import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private memoryCache: Map<string, string> = new Map();

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    try {
      this.client = new Redis({
        host,
        port,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed. Falling back to local memory cache.');
            return null; // Stop retrying
          }
          return Math.min(times * 50, 2000);
        },
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis error occurred:', err.message);
      });
    } catch (e) {
      this.logger.warn('Could not initialize Redis. Using local memory cache.');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.client && this.client.status === 'ready') {
      try {
        return await this.client.get(key);
      } catch (err) {
        this.logger.error('Redis GET failed, using memory cache:', err);
      }
    }
    return this.memoryCache.get(key) || null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        this.logger.error('Redis SET failed, using memory cache:', err);
      }
    }
    this.memoryCache.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.memoryCache.delete(key), ttlSeconds * 1000);
    }
  }

  async del(key: string): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        this.logger.error('Redis DEL failed:', err);
      }
    }
    this.memoryCache.delete(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      try {
        const stream = this.client.scanStream({ match: pattern, count: 100 });
        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            const pipeline = this.client!.pipeline();
            keys.forEach((k) => pipeline.del(k));
            pipeline.exec();
          }
        });
      } catch (err) {
        this.logger.error('Redis delByPattern failed:', err);
      }
    }
    for (const k of this.memoryCache.keys()) {
      if (k.startsWith(pattern.replace('*', ''))) {
        this.memoryCache.delete(k);
      }
    }
  }
}
