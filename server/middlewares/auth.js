const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.isAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong with authentication",
    });
  }
};

exports.isStudent = (req, res, next) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Student only route.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying student role",
    });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only route.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying admin role",
    });
  }
};
