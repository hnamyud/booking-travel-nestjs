import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/schema/user.schema';
import { UserService } from 'src/modules/user/user.service';
import { getInitUsers } from './data/users.sample';
import { Destination, DestinationDocument } from 'src/modules/destination/schema/destination.schema';
import { Tour, TourDocument } from 'src/modules/tour/schema/tour.schema';
import { get } from 'http';
import { getInitDestinations } from './data/destination.sample';
import { getInitTours } from './data/tour.sample';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
        @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
        private configService: ConfigService,
        private userService: UserService,
    ) { }

    async onModuleInit() {
        const shouldInit = this.configService.get<string>('INITED');
        this.logger.log('Seeding initial data...');
        if (!Boolean(shouldInit)) {
            this.logger.log('🚫 Seeding is disabled in .env (INITED != true)');
            return;
        }

        // SEED USERS
        const countUser = await this.userModel.count({});
        if (countUser === 0) {
            const users = await getInitUsers(
                this.configService,
                this.userService
            );
            await this.userModel.insertMany(users);
            this.logger.log('✅ Seeded users successfully');
        } else {
            this.logger.log('Users already exist, skipping seed');
        }

        // SEED DESTINATIONS
        const countDestination = await this.destinationModel.count({}); // await this.destinationModel.count({});
        if (countDestination === 0) {
            const destinations = await getInitDestinations();
            await this.destinationModel.insertMany(destinations);
            this.logger.log('✅ Seeded destinations successfully');

        } else {
            this.logger.log('Destinations already exist, skipping seed');
        }

        // SEED TOURS
        const countTour = await this.tourModel.count({}); // await this.tourModel.count({});
        if (countTour === 0) {
            const tours = await getInitTours();
            await this.tourModel.insertMany(tours);
            this.logger.log('✅ Seeded tours successfully');
        } else {
            this.logger.log('Tours already exist, skipping seed');
        }

    }
}
