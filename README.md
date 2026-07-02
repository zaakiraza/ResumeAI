# ResumeAI

ResumeAI is an AI-powered resume and career assistant platform that helps users create, edit, and manage professional resumes while accessing AI-driven tools such as writing assistance, interview preparation, and notifications.

## Overview

This project is organized into two main parts:

- Frontend: a React + Vite application for the user experience
- Backend: an Express.js API with authentication, resume management, AI integrations, and MongoDB persistence

## Key Features

- User authentication and authorization
- Google OAuth sign-in
- Resume creation, editing, and PDF viewing
- AI-powered writing and productivity tools
- Interview preparation support
- Feedback, contact, and newsletter modules
- Notifications and account management

## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Passport.js
- OpenAI integration
- Nodemailer
- Puppeteer for PDF-related workflows

## Project Structure

```text
ResumeAI/
├── Backend/
│   ├── app.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── docs/
```

## Prerequisites

Make sure you have the following installed:

- Node.js (recommended latest LTS)
- npm
- MongoDB instance or connection URI

## Installation

1. Clone the repository
2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../Backend
npm install
```

## Environment Variables

Create a `.env` file inside the Backend folder with the required configuration values, for example:

```env
PORT=5003
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5003/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## Running the Application

### Start the backend

```bash
cd Backend
npm start
```

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will typically run at `http://localhost:5173` and the backend at `http://localhost:5003`.

## Available Scripts

### Frontend
- `npm run dev` — start the Vite development server
- `npm run build` — build the production bundle
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

### Backend
- `npm start` — launch the backend server

## Notes

- The backend uses ES modules.
- The project includes AI-related endpoints and UI flows that depend on valid API credentials.
- Some features may require additional configuration for email, Google OAuth, and OpenAI services.

## License

This project is currently distributed under the ISC license.
