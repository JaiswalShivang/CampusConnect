const User = require("../models/User");
const Club = require("../models/Club");
const { uploadImagetoCloudinary } = require("../utils/imageUploader");

exports.createClub = async (req, res) => {
  try {
    const { name, description, category, links } = req.body;
    const admin = req.user;
    const images = req?.files?.images;

    if (!name || !description || !category || !admin || !images) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let imageArray = [];
    if (Array.isArray(images)) {
      for (let file of images) {
        const result = await uploadImagetoCloudinary(file, "clubs");
        imageArray.push(result.secure_url);
      }
    } else {
      const result = await uploadImagetoCloudinary(images, "clubs");
      imageArray.push(result.secure_url);
    }

    const newClub = await Club.create({
      name,
      description,
      category,
      photos: imageArray,
      links,
      admin: admin.id,
    });

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
      club: newClub,
    });
  } catch (error) {
    console.error("Create Club Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating club",
    });
  }
};

exports.getAllClub = async (req, res) => {
  try {
    const allClub = await Club.find({})
      .populate("admin", "name collegemailid photo")
      .populate("members", "name photo")
      .populate("events")
      .populate("announcement");

    return res.status(200).json({
      success: true,
      message: "All clubs fetched successfully",
      clubs: allClub,
    });
  } catch (error) {
    console.error("getAllClub Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch clubs",
    });
  }
};

exports.updateClub = async (req, res) => {
  try {
    const { name, clubid, description, category, links } = req.body;
    const admin = req.user;
    const images = req?.files?.images;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const club = await Club.findById(clubid);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    if (club.admin.toString() !== admin.id) {
      return res.status(403).json({
        success: false,
        message: "Only the club admin can update the club",
      });
    }

    let newImageUrls = [];
    if (images) {
      if (Array.isArray(images)) {
        for (let img of images) {
          const upload = await uploadImagetoCloudinary(img, "clubs");
          newImageUrls.push(upload.secure_url);
        }
      } else {
        const upload = await uploadImagetoCloudinary(images, "clubs");
        newImageUrls.push(upload.secure_url);
      }
    }

    const updatedClub = await Club.findByIdAndUpdate(
      clubid,
      {
        $set: {
          name: name || club.name,
          description: description || club.description,
          category: category || club.category,
          links: links || club.links,
          photos: [...club.photos, ...newImageUrls],
        },
      },
      { new: true } 
    );
    return res.status(200).json({
      success: true,
      message: "Club updated successfully",
      updatedClub,
    });
  } catch (error) {
    console.error("Update Club Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating club",
    });
  }
};

exports.deleteClub = async (req, res) => {
  try {
    const { clubId } = req.body;
    const user = req.user;

    if (!clubId || !user) {
      return res.status(400).json({
        success: false,
        message: "clubId and user (admin) are required",
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    if (club.admin.toString() !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this club",
      });
    }

    await Club.findByIdAndDelete(clubId);

    return res.status(200).json({
      success: true,
      message: "Club deleted successfully",
    });
  } catch (error) {
    console.error("Delete Club Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting club",
    });
  }
};
