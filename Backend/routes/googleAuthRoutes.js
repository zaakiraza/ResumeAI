import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

const router = express.Router();

// Google OAuth login route
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/signin?error=auth_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/signin?error=auth_failed`);
    }
  }
);

// Get user profile after OAuth
router.get('/google/success', async (req, res) => {
  try {
    const token = req.query.token;
    
    if (!token) {
      return errorResponse(res, 400, 'No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -otp');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Authentication successful', {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider
      }
    }, true);
  } catch (error) {
    console.error('Google success error:', error);
    return errorResponse(res, 500, 'Authentication failed', { error: error.message });
  }
});

export default router;
