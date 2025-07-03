const User = require("../models/User");
const Club = require("../models/Club");

exports.joinClubRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { clubId } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    if (club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this club",
      });
    }

    if (club.pendingRequests.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Join request already sent",
      });
    }

    club.pendingRequests.push(userId);
    await club.save();

    return res.status(200).json({
      success: true,
      message: "Join request sent successfully",
    });
  } catch (error) {
    console.error("Join Club Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending join request",
    });
  }
};

exports.approveJoinRequest = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { clubId, studentId } = req.body;

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
        message: "Unauthorized",
      });
    }

    if (!club.pendingRequests.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "No such pending request",
      });
    }

    club.pendingRequests = club.pendingRequests.filter(
      (id) => id.toString() !== studentId
    );
    club.members.push(studentId);
    await club.save();

    await User.findByIdAndUpdate(studentId, {
      $addToSet: { clubsjoined: clubId },
    });

    return res.status(200).json({
      success: true,
      message: "Join request approved",
    });
  } catch (error) {
    console.error("Approve Join Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while approving request",
    });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { clubId, studentId } = req.body;

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
        message: "Unauthorized",
      });
    }

    if (!club.pendingRequests.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "No such pending request",
      });
    }

    club.pendingRequests = club.pendingRequests.filter(
      (id) => id.toString() !== studentId
    );
    await club.save();

    return res.status(200).json({
      success: true,
      message: "Join request rejected successfully",
    });
  } catch (error) {
    console.error("Reject Join Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while rejecting request",
    });
  }
};


exports.getPendingRequests = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { clubId } = req.params;

    const club = await Club.findById(clubId).populate("pendingRequests", "name collegemailid photo");
    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: "Club not found" 
      });
    }

    if (club.admin.toString() !== adminId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized" });
    }

    return res.status(200).json({
      success: true,
      message: "Pending requests fetched successfully",
      pendingRequests: club.pendingRequests,
    });
  } catch (error) {
    console.error("Get Pending Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending requests",
    });
  }
};
