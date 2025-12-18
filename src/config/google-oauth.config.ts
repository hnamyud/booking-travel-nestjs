import { registerAs } from "@nestjs/config";


export default registerAs('googleOAuth', () => ({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectURI: process.env.GOOGLE_REDIRECT_URI,
}));