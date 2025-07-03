const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photos: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      required: true,
      enum: ["Event", "Update", "Opportunity", "Reminder"],
    },
    links:{
      type: [String],
      required: true
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
