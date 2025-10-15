const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth signup route (redirect method)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'https://resume-ai-frontend-three.vercel.app';
      res.redirect(`${frontendUrl}/auth-success?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'https://resume-ai-frontend-three.vercel.app';
      res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
    }
  }
);

// Google OAuth signup with ID token (for frontend direct integration)
router.post('/google/signup', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    const profilePicture = payload.picture;

    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: googleId });
    
    if (existingUser) {
      // Generate JWT token
      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Google signup successful',
        data: {
          user: {
            id: existingUser._id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            profilePicture: existingUser.profilePicture,
            isEmailVerified: existingUser.isEmailVerified
          },
          token: token
        }
      });
    }

    // Check if user exists with the email from Google profile
    const emailUser = await User.findOne({ email: email });
    
    if (emailUser) {
      // User exists with this email, link the Google account
      emailUser.googleId = googleId;
      emailUser.profilePicture = profilePicture || emailUser.profilePicture;
      emailUser.firstName = emailUser.firstName || firstName;
      emailUser.lastName = emailUser.lastName || lastName;
      emailUser.isEmailVerified = true;
      await emailUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: emailUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Google account linked successfully',
        data: {
          user: {
            id: emailUser._id,
            email: emailUser.email,
            firstName: emailUser.firstName,
            lastName: emailUser.lastName,
            profilePicture: emailUser.profilePicture,
            isEmailVerified: emailUser.isEmailVerified
          },
          token: token
        }
      });
    }

    // Create new user
    const newUser = new User({
      googleId: googleId,
      email: email,
      firstName: firstName,
      lastName: lastName,
      profilePicture: profilePicture,
      isEmailVerified: true, // Google emails are already verified
      authProvider: 'google'
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Google signup successful',
      data: {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          profilePicture: savedUser.profilePicture,
          isEmailVerified: savedUser.isEmailVerified
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Google OAuth signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Google signup failed',
      error: error.message
    });
  }
});

module.exports = router;
