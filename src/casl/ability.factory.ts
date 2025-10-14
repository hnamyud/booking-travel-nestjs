import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { HotelBooking } from '../hotel-bookings/schemas/hotel-booking.schema';
import { Action } from 'src/enum/action.enum';
import { User } from 'src/user/schema/user.schema';
import { Tour } from 'src/tour/schema/tour.schema';
import { Booking } from 'src/bookings/schemas/booking.schema';
import { AttractionTicket } from 'src/attraction-tickets/schemas/attraction-ticket.schema';
import { Destination } from 'src/destination/schema/destination.schema';
import { Review } from 'src/review/schema/review.schema';
import { Payment } from 'src/payments/schemas/payment.schema';
import { Service } from 'src/services/schemas/service.schema';
import { FlightTicket } from 'src/flight-tickets/schemas/flight-ticket.schema';

// Định nghĩa các subject (đối tượng) được phân quyền
export type Subjects = InferSubjects<
    typeof User | 
    typeof Tour | 
    typeof Booking |
    typeof Destination |
    typeof Review |
    typeof Payment |
    typeof Service |
    typeof HotelBooking |
    typeof AttractionTicket |
    typeof FlightTicket
    > | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.role === 'ADMIN') {
      // Admin có thể làm mọi thứ
      can(Action.Manage, 'all'); 
      cannot(Action.Delete, User, { role: 'ADMIN' });
    } else {
      // User thường
      can(Action.Create, [
        Booking, 
        Review
      ], { user_id: (user as any)._id });

      can(Action.Update, [      
        Review, 
        Booking
      ], { user_id: (user as any)._id });

      can(Action.Update, User, { _id: (user as any)._id });

      can(Action.Read, [
        Destination, 
        Review, 
        Payment, 
        Service, 
        Tour, 
        Booking, 
        User
      ]);
      
      can(Action.Read_All, [Review, Service]);
      // User chỉ có thể xem thông tin của chính họ
      can(Action.Read, User, { _id: (user as any)._id });

      // User chỉ có thể update/delete booking của chính họ
      can(Action.Delete, [Booking, Review], { user_id: (user as any)._id });
      can(Action.Delete, User, { _id: (user as any)._id });
      cannot(Action.Delete, User, { role: 'ADMIN' })
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}