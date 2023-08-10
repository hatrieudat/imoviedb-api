import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Implement the authentication User
const authenticate = async (req, res, next) => {
  try {
    let accessToken;
    // Check if the token is in the header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    }
    // Check missing token throw UnauthorizedError
    if (!accessToken) {
      throw new Error();
    }

    // If the token is in the header verify it
    const decodedToken = jwt.verify(
      accessToken,
      process.env.JWT_ACCESSTOKEN_SECRET
    );
    const userID = decodedToken.userID;
    const user = await User.findById(userID);
    // If user not found throw invalid token error
    if (!user) {
      throw new Error("Invalid token");
    }

    req.user = {
      id: user._id,
      role: user.role,
    };
    next();
  } catch (error) {
    // Check the token was expired by error.name === 'TokenExpiredError'
    if (error.name === "TokenExpiredError") {
      error.message = "Access token has expired. Please log in again.";
    }
    error.statusCode = 401;
    next(error);
  }
};

// Implement the authorization role (either User or Admin)
const authorize = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new Error();
      error.statusCode = 403;
      next(error);
    }
    next();
  };
};

export { authenticate, authorize };
