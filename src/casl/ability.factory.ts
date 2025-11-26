import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Action } from 'src/enum/action.enum';
import { User } from 'src/user/schema/user.schema';
import { Tour } from 'src/tour/schema/tour.schema';
import { Booking } from 'src/bookings/schemas/booking.schema';
import { Destination } from 'src/destination/schema/destination.schema';
import { Review } from 'src/review/schema/review.schema';
import { Payment } from 'src/payments/schemas/payment.schema';
import { UserRole } from 'src/enum/role.enum';
// Định nghĩa các subject (đối tượng) được phân quyền
export type Subjects = InferSubjects<
    typeof User | 
    typeof Tour | 
    typeof Booking |
    typeof Destination |
    typeof Review |
    typeof Payment 
    > | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.role === UserRole.Admin) {
      // Admin có thể làm mọi thứ
      can(Action.Manage, 'all'); 
      cannot(Action.Delete, User, { role: UserRole.Admin });
    } else {
      // User thường
      // User chỉ có thể create/update/delete booking của chính họ
      can([
        Action.Create,
        Action.Update,
        Action.Delete,
        Action.Read,
      ], [
        Booking, 
      ], { user_id: user._id });

      can(Action.Update, User, { _id: user._id });

      can(Action.Read, [Destination, Tour, Review]);
      can([Action.Read, Action.Read_All], Tour, { isAvailable: true });
      can([Action.Read, Action.Read_All], Destination);
      can([
        Action.Read, 
        Action.Read_All, 
      ], Review);
      can([ 
        Action.Create, 
        Action.Update, 
        Action.Delete
      ], Review, { user_id: user._id });

      can([Action.Read, Action.Create], Payment, { user_id: user._id });
      // User chỉ có thể xem thông tin của chính họ
      can(Action.Read, User, { _id: user._id });
      
      can(Action.Delete, User, { _id: user._id });
      cannot(Action.Delete, User, { role: UserRole.Admin })
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}