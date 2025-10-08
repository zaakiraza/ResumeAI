import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import connectDB from "./utils/DB.js";
import { startCronJob } from "./utils/cronJob.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";

dotenv.config();
const app = express();

// Security middlewares
app.use(helmet());

// uncomment it for security
// app.use(mongoSanitize());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
// connectDB();

// Start cron job
// startCronJob();

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("Hello, World! Your server is running 🎉");
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5003;
  app.listen(port, () => {
    console.log(`Click to Open Project: ${port}`);
  });
}
