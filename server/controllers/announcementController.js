const Announcement = require("../models/Announcement");
const Club = require("../models/Club");
const { uploadImagetoCloudinary } = require("../utils/imageUploader");

exports.createAnnouncement = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { clubId, name, description, category, links } = req.body;

    const photoFiles = req?.files?.photos;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    if (club.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Only club admin can create announcements",
      });
    }

    let photoArray = [];
    if (photoFiles) {
      if (Array.isArray(photoFiles)) {
        for (let file of photoFiles) {
          const uploaded = await uploadImagetoCloudinary(
            file,
            "announcement_photos"
          );
          photoArray.push(uploaded.secure_url);
        }
      } else {
        const uploaded = await uploadImagetoCloudinary(
          photoFiles,
          "announcement_photos"
        );
        photoArray.push(uploaded.secure_url);
      }
    }

    const announcement = await Announcement.create({
      name,
      description,
      category,
      links,
      photos: photoArray,
      admin: adminId,
      club: clubId,
    });

    await Club.findByIdAndUpdate(clubId, {
      $push: {
        announcement: announcement._id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating announcement",
    });
  }
};


exports.getAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await Announcement.findById(announcementId)
      .populate("admin", "name collegemailid photo");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement fetched successfully",
      announcement,
    });
  } catch (error) {
    console.error("Get Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching announcement",
    });
  }
};


exports.updateAnnouncement = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      announcementId,
      name,
      description,
      category,
      links
    } = req.body;

    const photoFiles = req?.files?.photos;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    if (announcement.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can update this announcement",
      });
    }

    let photoArray = [];
    if (photoFiles) {
      if (Array.isArray(photoFiles)) {
        for (let file of photoFiles) {
          const uploaded = await uploadImagetoCloudinary(file, "announcement_photos");
          photoArray.push(uploaded.secure_url);
        }
      } else {
        const uploaded = await uploadImagetoCloudinary(photoFiles, "announcement_photos");
        photoArray.push(uploaded.secure_url);
      }
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      {
        $set: {
          name: name || announcement.name,
          description: description || announcement.description,
          category: category || announcement.category,
          links: links || announcement.links,
          photos: [...announcement.photos, ...photoArray],
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Update Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating announcement",
    });
  }
};
