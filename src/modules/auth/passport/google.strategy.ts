import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from "@nestjs/config";
import googleOauthConfig from "src/config/google-oauth.config";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    private readonly logger = new Logger(GoogleStrategy.name);
    constructor(
        @Inject(googleOauthConfig.KEY) private googleConfiguration:
        ConfigType<typeof googleOauthConfig>,
        private authService: AuthService,
    ) {
        super({
            clientID: googleConfiguration.clientID,
            clientSecret: googleConfiguration.clientSecret,
            callbackURL: googleConfiguration.redirectURI,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string, 
        refreshToken: string, 
        profile: any, 
        done: VerifyCallback
    ) {
        const user = await this.authService.validateGoogleUser({
            email: profile.emails[0].value,
            name: profile.displayName,
        });
        done(null, user);
    }
}
