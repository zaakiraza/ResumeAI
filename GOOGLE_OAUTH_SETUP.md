# Google OAuth Setup Instructions

This document provides step-by-step instructions for setting up Google OAuth authentication in the ResumeAI application.

## Prerequisites

- Google Cloud Console access
- Backend and Frontend deployed or running locally

## Backend Setup

### 1. Install Required Packages

```bash
cd Backend
npm install passport passport-google-oauth20 express-session
```

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add name: "ResumeAI OAuth"
   
5. Configure Authorized Redirect URIs:
   
   **For Local Development:**
   ```
   http://localhost:5003/api/auth/google/callback
   ```
   
   **For Production:**
   ```
   https://your-backend-domain.com/api/auth/google/callback
   ```

6. Save and copy:
   - Client ID
   - Client Secret

### 3. Environment Variables

Add the following to your `.env` file in the Backend directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5003/api/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your_random_session_secret_here

# JWT (should already exist)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

**For Production:**
```env
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-domain.com
```

## Frontend Setup

### 1. Environment Variables

Add the following to your `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5003
```

**For Production:**
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

## Testing

### Local Testing

1. Start Backend:
```bash
cd Backend
npm start
```

2. Start Frontend:
```bash
cd frontend
npm run dev
```

3. Navigate to `http://localhost:5173/signin` or `/signup`
4. Click "Continue with Google" button
5. Authorize the application
6. You should be redirected to the dashboard

### Production Testing

1. Ensure all environment variables are set in production
2. Make sure authorized redirect URIs in Google Console match your production URLs
3. Test the OAuth flow end-to-end

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Error: `redirect_uri_mismatch`
   - Solution: Ensure the callback URL in Google Console matches exactly with `GOOGLE_CALLBACK_URL`

2. **Invalid Client**
   - Error: `invalid_client`
   - Solution: Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

3. **Session Issues**
   - Error: Session not persisting
   - Solution: Ensure `SESSION_SECRET` is set and `express-session` is configured properly

4. **CORS Errors**
   - Solution: Make sure CORS is configured in `app.js` to allow your frontend domain

## Security Notes

- Never commit `.env` files to version control
- Use strong, random strings for `SESSION_SECRET`
- In production, ensure `secure: true` for cookies (HTTPS required)
- Regularly rotate OAuth credentials
- Review authorized redirect URIs periodically

## Features

- ✅ Google Sign-In for existing users
- ✅ Google Sign-Up for new users
- ✅ Automatic email verification for Google users
- ✅ Profile picture sync from Google
- ✅ Account linking if email already exists
- ✅ JWT token generation for authenticated sessions

## Flow Diagram

```
User clicks "Sign in with Google"
    ↓
Frontend redirects to backend OAuth endpoint
    ↓
Backend redirects to Google OAuth consent screen
    ↓
User authorizes application
    ↓
Google redirects back to backend callback URL
    ↓
Backend creates/updates user and generates JWT
    ↓
Backend redirects to frontend with JWT token
    ↓
Frontend stores token and redirects to dashboard
```

## Files Modified/Created

### Backend
- ✅ `models/user.js` - Added OAuth fields
- ✅ `config/passport.js` - Passport Google Strategy configuration
- ✅ `routes/googleAuthRoutes.js` - Google OAuth routes
- ✅ `app.js` - Added session and passport middleware

### Frontend
- ✅ `pages/AuthSuccess.jsx` - OAuth success handler
- ✅ `pages/PublicPages/login/ignin.jsx` - Added Google Sign-In button
- ✅ `pages/PublicPages/register/signup.jsx` - Added Google Sign-Up button
- ✅ `App.jsx` - Added auth success route

## Support

For issues or questions, please create an issue in the repository.
