
import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Action } from 'src/core/abilities/action.enum';
import { UserRole } from 'src/common/enum/role.enum';
import { StatusBooking } from 'src/common/enum/status-booking.enum';
import { User } from 'src/modules/user/schema/user.schema';
import { Tour } from 'src/modules/tour/schema/tour.schema';
import { Booking } from 'src/modules/booking/schemas/booking.schema';
import { Destination } from 'src/modules/destination/schema/destination.schema';
import { Review } from 'src/modules/review/schema/review.schema';
import { Payment } from 'src/modules/payment/schemas/payment.schema';
// Định nghĩa các subject (đối tượng) được phân quyền
export type ClassSubjects = InferSubjects<
  typeof User |
  typeof Tour |
  typeof Booking |
  typeof Destination |
  typeof Review |
  typeof Payment
> | 'all';

export type Subjects = ClassSubjects | 'Statistic' | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    // Ai cũng có quyền này (kể cả User, Mod, Admin)
    can([Action.Read, Action.Read_All], Destination);
    can([Action.Read_All], Review);
    can(Action.Update, User, { _id: user._id });

    switch (user.role) {
      // *****************
      // * CASE 1: ADMIN *
      // *****************
      case UserRole.Admin:
        can(Action.Manage, 'all');
        cannot(Action.Delete, User, { role: UserRole.Admin }); // Không được xóa Admin
        // Admin không được tự đặt tour
        cannot(Action.Create, Booking);

        // Admin không được tự thanh toán
        cannot(Action.Create, Payment);

        // Admin không được viết Review (quan trọng nhất)
        cannot(Action.Create, Review);
        break;
      // *********************
      // * CASE 2: MODERATOR *
      // *********************
      case UserRole.Moderator:
        can(Action.Read_All, [User, Tour, Booking, Payment]);
        can(Action.Create, Booking);
        can(Action.Update, Booking, ['status', 'payment_status', 'note', 'contactInfo']);
        can(Action.CheckIn, Booking, { status: StatusBooking.Confirmed });
        can(Action.Update, Payment, ['status']);
        can(Action.Delete, Review);
        cannot(Action.Update, Review);
        can(Action.Read, 'Statistic');

        cannot(Action.Create, Tour);
        cannot(Action.Update, Tour);
        cannot(Action.Delete, Tour);
        break;
      // ****************
      // * CASE 3: USER *
      // ****************
      case UserRole.User:
        can([Action.Read, Action.Read_All], Tour, { isAvailable: true });
        can([
          Action.Create,
          Action.Update,
          Action.Delete,
          Action.Read,
        ], [
          Booking,
        ], { user_id: user._id });

        can([Action.Create, Action.Update, Action.Read, Action.Delete], Review, { user_id: user._id });

        can([Action.Read, Action.Create], Payment, { user_id: user._id });
        // User chỉ có thể xem thông tin của chính họ
        can(Action.Read, User, { _id: user._id });

        can(Action.Delete, User, { _id: user._id });
        cannot(Action.Delete, User, { role: UserRole.Admin });
        break;
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}