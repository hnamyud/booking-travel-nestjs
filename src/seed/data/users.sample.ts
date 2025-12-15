import { ConfigService } from "@nestjs/config"
import { UserRole } from "src/common/enum/role.enum"
import { UserService } from "src/modules/user/user.service"

export const getInitUsers = async (
    configService: ConfigService,
    userService: UserService
) => {
    return [
        {
            name: 'Admin',
            email: configService.get<string>('ADMIN_EMAIL'),
            password: await userService.getHashPassword(configService.get<string>('INIT_PASSWORD')),
            birthDay: new Date('2000-01-01'),
            gender: 'MALE',
            address: 'Hanoi, Vietnam',
            roles: UserRole.Admin,
        },
        {
            name: 'User',
            email: configService.get<string>('USER_EMAIL'),
            password: await userService.getHashPassword(configService.get<string>('INIT_PASSWORD')),
            birthDay: new Date('2000-01-01'),
            gender: 'MALE',
            address: 'Hanoi, Vietnam',
            roles: UserRole.User,
        },
        {
            name: 'Mạnh',
            email: configService.get<string>('TEST_EMAIL'),
            password: await userService.getHashPassword(configService.get<string>('INIT_PASSWORD')),
            birthDay: new Date('2000-01-01'),
            gender: 'MALE',
            address: 'Hanoi, Vietnam',
            roles: UserRole.User,
        },
        {
            name: 'Moderator',
            email: configService.get<string>('MOD_EMAIL'),
            password: await userService.getHashPassword(configService.get<string>('INIT_PASSWORD')),
            birthDay: new Date('2000-01-01'),
            gender: 'MALE',
            address: 'Hanoi, Vietnam',
            roles: UserRole.Moderator,
        }
    ]
}