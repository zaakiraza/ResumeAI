import express from "express";
import { authController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authentication.js";

const authRouter = express.Router();

authRouter.post("/login", authController.loginUser);
authRouter.post("/adminLogin", authController.adminLogin);

authRouter.post("/register", authController.registerUser);
authRouter.get("/resendOtp", authenticateToken, authController.resendOtp);
authRouter.post("/verifyOtp", authenticateToken, authController.verifyOtp);

authRouter.post("/forgotPasswordOtp", authController.forgotPasswordOtp);
authRouter.post(
  "/verifyforgotPasswordOtp",
  authController.verifyChangePasswordOtp
);
authRouter.post("/requestPassword", authController.requestPassword);

authRouter.post(
  "/changePassword",
  authenticateToken,
  authController.changePassword
);

export default authRouter;
