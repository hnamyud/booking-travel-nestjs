import { SetMetadata } from '@nestjs/common';
import { AppAbility } from 'src/modules/casl/ability.factory';


export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
  message?: string;
}

export type PolicyHandler = IPolicyHandler;

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);