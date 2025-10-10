import { successHandler, errorHandler } from "../Utils/responseHandler.js";
import user from "../Models/userModel.js";
import { hash, compare } from "bcrypt";
import { sendEmail } from "../Utils/nodeMailer.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { userName, email, password, phone } = req.body;

    if (!userName || !email || !password || !phone) {
      return errorHandler(res, 400, "All fields are required");
    }

    const isUserExists = await user.findOne({ email });
    if (isUserExists) {
      return errorHandler(res, 400, "Email already exists");
    }

    const isUserNameExists = await user.findOne({
      userName: userName.toLocaleLowerCase(),
    });
    if (isUserNameExists) {
      return errorHandler(res, 400, "Username already exists");
    }

    const hashedPassword = await hash(password, 12);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

    const newUser = new user({
      userName: userName.toLocaleLowerCase(),
      email,
      password: hashedPassword,
      phone,
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

    return successHandler(res, 201, "User registered. OTP sent to email.", {
      userId: newUser._id,
      email: newUser.email,
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return errorHandler(res, 500, "Internal server error", error.message);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const userDetail = await user.findOne({ email });

  if (!userDetail) {
    return errorHandler(res, 400, "Invalid email or password");
  }

  const isPasswordMatch = await compare(password, userDetail.password);
  if (!isPasswordMatch) {
    return errorHandler(res, 400, "Invalid email or password");
  }

  const token = jwt.sign({ userId: userDetail._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return successHandler(res, 201, "User login successfully.", token);
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user;

    if (!otp) {
      return errorHandler(res, 400, "OTP is required");
    }

    const userDetail = await user.findById(userId.userId);
    if (!userDetail) {
      return errorHandler(res, 404, "User not found");
    }

    if (!userDetail.otp || !userDetail.otpExpiresAt) {
      return errorHandler(res, 400, "No OTP found. Please register again.");
    }

    if (userDetail.otpExpiresAt < Date.now()) {
      return errorHandler(res, 400, "OTP has expired.");
    }

    if (otp != userDetail.otp) {
      return errorHandler(res, 400, "Invalid OTP");
    }

    userDetail.verified = true;
    userDetail.otp = undefined;
    userDetail.otpExpiresAt = undefined;
    await userDetail.save();

    return successHandler(res, 200, "OTP verified successfully", {
      userId: userDetail._id,
      verified: userDetail.verified,
    });
  } catch (error) {
    return errorHandler(res, 500, "Internal server error", error.message);
  }
};

const resendOtp = async (req, res) => {
  const userId = req.user;

  const userDetail = await user.findById(userId.userId);
  if (!userDetail) {
    return errorHandler(res, 404, "User not found");
  }

  if (userDetail.verified) {
    return errorHandler(res, 400, "User already verified");
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
  return successHandler(res, 200, "verification code send successfully");
};

const forgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return errorHandler(res, 404, "Email is are missing");
  }

  const userDetails = await user.findOne({ email: req.body.email });
  if (!userDetails) {
    return errorHandler(res, 400, "Invalid Email");
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

  return successHandler(
    res,
    200,
    "Email verification code has been sent to your email",
    data
  );
};

const verifyChangePasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return errorHandler(res, 404, "Feilds are missing");
  }

  const userDetails = await user.findOne({ email: email });
  if (!userDetails) {
    return errorHandler(res, 400, "Invalid Email");
  }

  if (otp != userDetails.otp) {
    return errorHandler(res, 400, "Invalid OTP");
  }

  if (Date.now() >= userDetails.otpExpiresAt) {
    return errorHandler(res, 400, "OTP expires");
  }

  userDetails.otp = undefined;
  userDetails.otpExpiresAt = undefined;
  await userDetails.save();
  return successHandler(res, 200, "Verified successfully");
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return errorHandler(res, 404, "Email is are missing");
  }

  const userDetail = await user.findOne({ email });
  if (!userDetail) {
    return errorHandler(res, 404, "User not found");
  }

  const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
  userDetail.password = await hash(newPassword, 12);
  await userDetail.save();

  await sendEmail(
    userDetail.email,
    "Forget password request",
    `Dear ${userDetail.userName}, \n Your new password is ${newPassword}`
  );
  return successHandler(
    res,
    200,
    "Your new password has been send to your mail"
  );
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user;
  if (!oldPassword || !newPassword) {
    return errorHandler(res, 400, "All fields are required");
  }

  const userDetail = await user.findById(userId.userId);
  if (!userDetail) {
    return errorHandler(res, 400, "Invalid user");
  }

  if (oldPassword == newPassword) {
    return errorHandler(res, 400, "new password can't same as new Password");
  }

  const isPasswordMatch = await compare(oldPassword, userDetail.password);
  if (!isPasswordMatch) {
    return errorHandler(res, 400, "Invalid old password");
  }

  userDetail.password = await hash(newPassword, 12);
  await userDetail.save();

  return successHandler(res, 200, "password successfully changed");
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await user.findOne({ email });
  if (!userDetail) {
    return errorHandler(res, 400, "Access Denied");
  }

  const isPasswordMatch = await compare(password, userDetail.password);
  if (!isPasswordMatch) {
    return errorHandler(res, 400, "Invalid email or password");
  }

  if (!userDetail.isAdmin) {
    return errorHandler(res, 400, "not allowed");
  }

  const token = jwt.sign({ userId: userDetail._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_admin_EXPIRES_IN,
  });
  return successHandler(res, 200, "login sccessfully", token);
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
