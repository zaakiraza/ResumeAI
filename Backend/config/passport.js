import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      // User exists, return the user
      return done(null, existingUser);
    }

    // Check if user exists with the email from Google profile
    const emailUser = await User.findOne({ email: profile.emails[0].value });
    
    if (emailUser) {
      // User exists with this email, link the Google account
      emailUser.googleId = profile.id;
      emailUser.profilePicture = profile.photos[0]?.value || emailUser.profilePicture;
      emailUser.authProvider = 'google';
      emailUser.isEmailVerified = true;
      emailUser.verified = true;
      await emailUser.save();
      return done(null, emailUser);
    }

    // Create new user
    const userName = profile.emails[0].value.split('@')[0];
    const newUser = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      userName: userName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profilePicture: profile.photos[0]?.value,
      isEmailVerified: true,
      verified: true,
      authProvider: 'google'
    });

    const savedUser = await newUser.save();
    return done(null, savedUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;