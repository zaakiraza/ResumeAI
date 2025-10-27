import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import session from "express-session";
// import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import connectDB from "./utils/DB.js";
// import { startCronJob } from "./utils/cronJob.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";
import resumeRouter from "./routes/resumeRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import feedbackRouter from "./routes/feedbackRoutes.js";
import aiToolsRouter from "./routes/aiToolsRoutes.js";
import googleAuthRouter from "./routes/googleAuthRoutes.js";

// Load environment variables FIRST
dotenv.config();

// Now import passport after env vars are loaded
const { default: passport } = await import("./config/passport.js");

const app = express();

// CORS must be applied first
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Security middlewares (after body parsing)
app.use(helmet());

// MongoDB sanitization (after body parsing)
// app.use(mongoSanitize());

// Rate limiting
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );

connectDB();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/auth", googleAuthRouter); // Google OAuth routes
app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/ai", aiToolsRouter);

app.get("/", (req, res) => {
  res.send("Hello, World! Your server is running 🎉");
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5003;
  app.listen(port, () => {
    console.log("Server is running");
  });
}

export default app;
