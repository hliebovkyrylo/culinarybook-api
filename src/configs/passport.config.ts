import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { userService } from '../services/user.service';
import bcrypt from "bcrypt";
import { createAccessToken, createNoSerializedRefreshToken } from '../utils/token';

export const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
export const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL as string;

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await userService.getUserByEmail(profile.emails ? profile.emails[0].value : '');

        let user = existingUser;

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(accessToken, 8);
          user = await userService.createUserByGoogle(profile, hashedPassword);
        }

        const access_token = createAccessToken(user?.id as string);
        const refresh_token = createNoSerializedRefreshToken(user?.id as string);

        req.res?.cookie('refresh_token', refresh_token, { 
          httpOnly: true, 
          secure: process.env.PRODUCTION === 'true' ? true : false,
          sameSite: process.env.PRODUCTION === 'true' ? 'strict' : 'lax',
          maxAge: 60 * 60 * 24 * 31,
          path: '/' 
        });
        req.res?.cookie('access_token', access_token, { httpOnly: false, secure: false, domain: '.culinarybook.website', maxAge: 60 * 60 * 24 * 2 });

        return done(null, user || undefined);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  userService.getUserById(id).then((user) => {
    done(null, user);
  });
});
