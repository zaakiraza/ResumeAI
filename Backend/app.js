import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import connectDB from "./utils/DB.js";
// import { startCronJob } from "./utils/cronJob.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";

dotenv.config();
const app = express();

// CORS must be applied first
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Security middlewares (after body parsing)
app.use(helmet());

// MongoDB sanitization (after body parsing)
// app.use(mongoSanitize());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("Hello, World! Your server is running 🎉");
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5003;
  app.listen(port, () => {
    // console.log(`Click to Open Project: ${port}`);
    console.log("Server is running");
  });
}
