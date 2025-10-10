import { successResponse, errorResponse } from "../utils/responseHandler.js";
import User from "../models/user.js";
import { hash, compare } from "bcrypt";
import { sendEmail } from "../utils/nodeMailer.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "All fields are required");
    }

    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
      return errorResponse(res, 400, "Email already exists");
    }

    const hashedPassword = await hash(password, 12);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

    const userName = email.split("@")[0];
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      isAdmin: false,
      verified: false,
      otp: otp,
      otpExpiresAt,
    });

    await newUser.save();
    await sendEmail(
      email,
      "Your OTP Verification Code",
      `Dear ${userName}, \n Your OTP code is: ${otp}. It will expire in 1 minute.`
    );

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return successResponse(res, 201, "User registered. OTP sent to email.", {
      userId: newUser._id,
      email: newUser.email,
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return errorResponse(res, 500, "Internal server error", error.message);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const userDetail = await User.findOne({ email });

  if (!userDetail) {
    return errorResponse(res, 400, "Invalid email or password");
  }

  const isPasswordMatch = await compare(password, userDetail.password);
  if (!isPasswordMatch) {
    return errorResponse(res, 400, "Invalid email or password");
  }

  const token = jwt.sign({ userId: userDetail._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return successResponse(res, 201, "User login successfully.", token);
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user;

    if (!otp) {
      return errorResponse(res, 400, "OTP is required");
    }

    const userDetail = await User.findById(userId.userId);
    if (!userDetail) {
      return errorResponse(res, 404, "User not found");
    }

    if (!userDetail.otp || !userDetail.otpExpiresAt) {
      return errorResponse(res, 400, "No OTP found. Please register again.");
    }

    if (userDetail.otpExpiresAt < Date.now()) {
      return errorResponse(res, 400, "OTP has expired.");
    }

    if (otp != userDetail.otp) {
      return errorResponse(res, 400, "Invalid OTP");
    }

    userDetail.verified = true;
    userDetail.otp = undefined;
    userDetail.otpExpiresAt = undefined;
    await userDetail.save();

    return successResponse(res, 200, "OTP verified successfully", {
      userId: userDetail._id,
      verified: userDetail.verified,
    });
  } catch (error) {
    return errorResponse(res, 500, "Internal server error", error.message);
  }
};

const resendOtp = async (req, res) => {
  const userId = req.user;

  const userDetail = await User.findById(userId.userId);
  if (!userDetail) {
    return errorResponse(res, 404, "User not found");
  }

  if (userDetail.verified) {
    return errorResponse(res, 400, "User already verified");
  }

  if (userDetail.otp && userDetail.otpExpiresAt > Date.now()) {
    return errorResponse(res, 400, "The last OTP is not expired.");
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

  userDetail.otp = otp;
  userDetail.otpExpiresAt = otpExpiresAt;
  await userDetail.save();

  await sendEmail(
    userDetail.email,
    "Request for resend OTP",
    `Dear ${userDetail.userName},\nYour OTP code is: ${otp}. It will expire in 1 minute.`
  );
  return successResponse(res, 200, "verification code send successfully");
};

const forgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return errorResponse(res, 404, "Email is are missing");
  }

  const userDetails = await User.findOne({ email: req.body.email });
  if (!userDetails) {
    return errorResponse(res, 400, "Invalid Email");
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

  userDetails.otp = otp;
  userDetails.otpExpiresAt = otpExpiresAt;
  await userDetails.save();

  const data = {
    email: email,
    otpExpiresAt: otpExpiresAt,
  };

  await sendEmail(
    email,
    "Your Email Verification Code",
    `Dear ${userDetails.userName}, \n Your OTP code is: ${otp}. It will expire in 1 minute.`
  );

  return successResponse(
    res,
    200,
    "Email verification code has been sent to your email",
    data
  );
};

const verifyChangePasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return errorResponse(res, 404, "Feilds are missing");
  }

  const userDetails = await User.findOne({ email: email });
  if (!userDetails) {
    return errorResponse(res, 400, "Invalid Email");
  }

  if (otp != userDetails.otp) {
    return errorResponse(res, 400, "Invalid OTP");
  }

  if (Date.now() >= userDetails.otpExpiresAt) {
    return errorResponse(res, 400, "OTP expires");
  }

  userDetails.otp = undefined;
  userDetails.otpExpiresAt = undefined;
  await userDetails.save();
  return successResponse(res, 200, "Verified successfully");
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return errorResponse(res, 404, "Email is are missing");
  }

  const userDetail = await User.findOne({ email });
  if (!userDetail) {
    return errorResponse(res, 404, "User not found");
  }

  const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
  userDetail.password = await hash(newPassword, 12);
  await userDetail.save();

  await sendEmail(
    userDetail.email,
    "Forget password request",
    `Dear ${userDetail.userName}, \n Your new password is ${newPassword}`
  );
  return successResponse(
    res,
    200,
    "Your new password has been send to your mail"
  );
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user;
  if (!oldPassword || !newPassword) {
    return errorResponse(res, 400, "All fields are required");
  }

  const userDetail = await User.findById(userId.userId);
  if (!userDetail) {
    return errorResponse(res, 400, "Invalid user");
  }

  if (oldPassword == newPassword) {
    return errorResponse(res, 400, "new password can't same as new Password");
  }

  const isPasswordMatch = await compare(oldPassword, userDetail.password);
  if (!isPasswordMatch) {
    return errorResponse(res, 400, "Invalid old password");
  }

  userDetail.password = await hash(newPassword, 12);
  await userDetail.save();

  return successResponse(res, 200, "password successfully changed");
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await User.findOne({ email });
  if (!userDetail) {
    return errorResponse(res, 400, "Access Denied");
  }

  const isPasswordMatch = await compare(password, userDetail.password);
  if (!isPasswordMatch) {
    return errorResponse(res, 400, "Invalid email or password");
  }

  if (!userDetail.isAdmin) {
    return errorResponse(res, 400, "not allowed");
  }

  const token = jwt.sign({ userId: userDetail._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_admin_EXPIRES_IN,
  });
  return successResponse(res, 200, "login sccessfully", token);
};

export const authController = {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  forgotPasswordOtp,
  verifyChangePasswordOtp,
  forgotPassword,
  changePassword,
  adminLogin,
};
