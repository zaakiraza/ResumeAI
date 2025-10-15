const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
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
      await emailUser.save();
      return done(null, emailUser);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profilePicture: profile.photos[0]?.value,
      isEmailVerified: true, // Google emails are already verified
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

module.exports = passport;