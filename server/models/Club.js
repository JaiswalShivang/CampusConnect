const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
      required: true
    },
    links:{
      type: [String],
      required: true
    },
    announcement: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      }
    ],
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Club", ClubSchema);
