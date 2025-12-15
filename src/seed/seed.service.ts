import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/schema/user.schema';
import { UserService } from 'src/modules/user/user.service';
import { getInitUsers } from './data/users.sample';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private configService: ConfigService,
        private userService: UserService,
    ) { }

    async onModuleInit() {
        const isInit = this.configService.get<string>('INITED');
        if (Boolean(isInit)) {
            this.logger.log('Seeding initial data...');

            const countUser = await this.userModel.count({});
            if (countUser > 0) {
                this.logger.log('Users already exist, skipping seed');
                return;
            }

            const users = await getInitUsers(
                this.configService,
                this.userService
            );
            await this.userModel.insertMany(users);
            this.logger.log('✅ Seeded users successfully');
        }
    }
}
