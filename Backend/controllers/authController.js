import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const authController = {
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return errorResponse(res, "User not found", 404);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return errorResponse(res, "Invalid credentials", 400);

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return successResponse(res, { token }, "Login successful");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },
};
