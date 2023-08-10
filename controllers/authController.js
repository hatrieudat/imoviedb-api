import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "../models/userModel.js";
import Session from "../models/sessionModel.js";

dotenv.config();

const {
  JWT_ACCESSTOKEN_SECRET,
  JWT_ACCESSTOKEN_EXPIRES_IN,
  JWT_REFRESHTOKEN_SECRET,
  JWT_REFRESHTOKEN_EXPIRES_IN,
} = process.env;

// Generate Token function (Refresh token and Access token)
const generateToken = (userID, secret_key, expiresIn) => {
  return jwt.sign({ userID }, secret_key, {
    expiresIn: expiresIn,
  });
};

// @desc    Register user
// @route   POST /auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const user = new User(req.body);

    // Create user
    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.message =
        "Email is already in use. Please enter a different email.";
    }
    // Set error status code to 400 for "Users validation failed"
    error.statusCode = 400;
    next(error);
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error("Password is incorrect");
    }

    // Generate access token
    const accessToken = generateToken(
      user._id,
      JWT_ACCESSTOKEN_SECRET,
      JWT_ACCESSTOKEN_EXPIRES_IN
    );
    // Generate refresh token
    const refreshToken = generateToken(
      user._id,
      JWT_REFRESHTOKEN_SECRET,
      JWT_REFRESHTOKEN_EXPIRES_IN
    );

    // Check if user_id exists on sessions collection
    const session = await Session.findOne({ user_id: user._id });
    if (!session) {
      // Create new session
      await Session.create({
        user_id: user._id,
        refresh_token: refreshToken,
      });
    } else {
      // Update refresh token
      await Session.updateOne(
        { user_id: user._id },
        { refresh_token: refreshToken }
      );
    }

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    // Set error status code for each Caught Exception
    switch (error.message) {
      case "User not found":
        error.message = "Email is not registered. Please register first";
        error.statusCode = 401;
        break;
      case "Password is incorrect":
        error.statusCode = 401;
        break;
      default:
        break;
    }
    next(error);
  }
};

// @desc    Refresh the token
// @route   POST /auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    // Check if refresh token exists
    if (!refresh_token) {
      throw new Error("refresh_token not found");
    }

    // Check if refresh token exists
    const session = await Session.findOne({ refresh_token });
    if (!session) {
      throw new Error("Session not found");
    }

    // Check if refresh token is expired
    jwt.verify(refresh_token, JWT_REFRESHTOKEN_SECRET, (err, decoded) => {
      if (err?.name === "TokenExpiredError") {
        // Delete session and throw Error
        Session.deleteOne({ refresh_token });
        throw new Error("Refresh token is expired");
      }
    });

    // Generate access token
    const accessToken = generateToken(
      session.user_id,
      JWT_ACCESSTOKEN_SECRET,
      JWT_ACCESSTOKEN_EXPIRES_IN
    );

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    // Set error status code for each Caught Exception
    switch (error.message) {
      case "refresh_token not found":
        error.message += ". Please provide refresh_token";
        error.statusCode = 400;
        break;
      case "Session not found":
        error.message += ". Please provide valid refresh token";
        error.statusCode = 404;
        break;
      case "Refresh token is expired":
        error.message += ". Please login again";
        error.statusCode = 401;
        break;
      default:
        break;
    }
    next(error);
  }
};

// @desc    Logout user
// @route   POST /auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Check if user_id exists on sessions collection
    const session = await Session.findOne({ user_id });
    if (!session) {
      throw new Error("Session not found");
    }

    // Delete session
    await Session.deleteOne({ user_id });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    // Set error status code for each Caught Exception
    switch (error.message) {
      case "Session not found":
        error.message += ". Please provide valid user_id by logging in";
        error.statusCode = 404;
        break;
      default:
        break;
    }
    next(error);
  }
};

export { register, login, logout, refreshToken };
