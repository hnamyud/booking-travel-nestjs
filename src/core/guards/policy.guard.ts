import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY, PolicyHandler } from 'src/core/decorator/policy.decorator';
import { CaslAbilityFactory } from '../abilities/ability.factory';


@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (policyHandlers.length === 0) {
      return true; // Không có policy được áp dụng
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    
    const ability = this.caslAbilityFactory.createForUser(user);

    const canAccess = policyHandlers.every((handler) => handler.handle(ability));
    if (!canAccess) {
      const customMessage = policyHandlers[0].message || 'Bạn không có đủ quyền hạn để thực hiện thao tác này';
      throw new ForbiddenException(customMessage);
    }

    return policyHandlers.every((handler) =>
      handler.handle(ability),
    );
  }
}