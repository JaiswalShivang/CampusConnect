const User = require("../models/User");
const bcrypt = require("bcrypt");
const { uploadImagetoCloudinary } = require("../utils/imageUploader");
const jwt = require("jsonwebtoken");
require("dotenv").config();


exports.signup = async (req, res) => {
  try {
    const { name, collegemailid, gender, phone, role, password } = req.body;
    const file = req.files?.photo;

    if (!name || !collegemailid || !gender || !phone || !role || !password || !file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ collegemailid });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const uploadResult = await uploadImagetoCloudinary(file, "user-profile");

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      collegemailid,
      gender,
      phone,
      role,
      password: hashedPassword,
      photo: uploadResult.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { collegemailid, password } = req.body;

    if (!collegemailid || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ collegemailid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const payload = {
      id: user._id,
      role: user.role,
      email: user.collegemailid,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    const userData = user.toObject();
    userData.token = token;
    userData.password = undefined;

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
};
