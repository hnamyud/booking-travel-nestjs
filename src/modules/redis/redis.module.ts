import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { LockService } from 'src/common/services/lock.services';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new (Redis as any)({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          maxRetriesPerRequest: null
        })
      },
      inject: [ConfigService]
    },
    LockService,
  ],
  exports: ['REDIS_CLIENT', LockService],
})
export class RedisModule {}
