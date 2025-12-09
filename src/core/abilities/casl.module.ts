import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
