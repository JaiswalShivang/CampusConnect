const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
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
      enum: ["Workshop", "Competition", "Seminar", "Webinar", "Other"]
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
    },
    announcement : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      }
    ],
    date: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);