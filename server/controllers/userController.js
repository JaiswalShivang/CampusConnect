const User = require("../models/User");
const Club = require("../models/Club")
const { uploadImagetoCloudinary } = require("../utils/imageUploader");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing from request",
      });
    }

    const getUser = await User.findById(userId)
      .populate("clubsjoined", "name");

    if (!getUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user: getUser,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching profile",
    });
  }
};


exports.getMyClubs = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate("clubsjoined", "name description photos category");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched user's clubs successfully",
      clubs: user.clubsjoined,
    });
  } catch (error) {
    console.error("getMyClubs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user's clubs",
    });
  }
};


exports.editUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, gender, phone } = req.body;
    const photoFile = req?.files?.photo;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let photoUrl = user.photo; 
    if (photoFile) {
      const upload = await uploadImagetoCloudinary(photoFile, "profile_photos");
      photoUrl = upload.secure_url;
    }

    
    const editUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name || user.name,
          gender: gender || user.gender,
          phone: phone || user.phone,
          photo: photoUrl,
        },
      },
      { new: true }
    );

    
    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: editUser,
    });
  } catch (error) {
    console.error("editUserInfo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user profile",
    });
  }
};