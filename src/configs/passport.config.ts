import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { userService } from '../services/user.service';
import bcrypt from "bcrypt";

export const googleClientId     = process.env.GOOGLE_CLIENT_ID as string;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
export const googleCallbackUrl  = process.env.GOOGLE_CALLBACK_URL as string;

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await userService.getUserByEmail(profile.emails ? profile.emails[0].value : '');

      if (existingUser) {
        return done(null, existingUser);
      }

      const hashedPassword = await bcrypt.hash(accessToken, 8);

      const user = await userService.createUserByGoogle(profile, hashedPassword);

      return done(null, user);
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