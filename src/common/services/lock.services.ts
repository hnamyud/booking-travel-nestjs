// src/common/services/lock.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';


@Injectable()
export class LockService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis
  ) {}

  // Acquire distributed lock
  async acquireLock(key: string, ttl: number = 10000): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    const result = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
    return result === 'OK';
  }

  // Release lock
  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.redis.del(lockKey);
  }

  // Execute with lock
  async withLock<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttl: number = 10000
  ): Promise<T> {
    const maxRetries = 5;
    const retryDelay = 100;

    for (let i = 0; i < maxRetries; i++) {
      if (await this.acquireLock(key, ttl)) {
        try {
          return await fn();
        } finally {
          await this.releaseLock(key);
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
    }

    throw new Error(`Failed to acquire lock for key: ${key}`);
  }
}