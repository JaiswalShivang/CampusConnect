const Event = require("../models/Event");
const Club = require("../models/Club");
const { uploadImagetoCloudinary } = require("../utils/imageUploader");

exports.createEvent = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      clubId,
      name,
      description,
      category,
      links,
      date,
      venue,
    } = req.body;

    const photoFiles = req?.files?.photos;


    const findClub = await Club.findById(clubId);
    if (!findClub) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

   
    if (findClub.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Only club admin can create events",
      });
    }

   
    if (!name || !description || !category || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    
    let photoArray = [];
    if (photoFiles) {
      if (Array.isArray(photoFiles)) {
        for (let file of photoFiles) {
          const uploaded = await uploadImagetoCloudinary(file, "event_photos");
          photoArray.push(uploaded.secure_url);
        }
      } else {
        const uploaded = await uploadImagetoCloudinary(photoFiles, "event_photos");
        photoArray.push(uploaded.secure_url);
      }
    }

 
    const createdEvent = await Event.create({
      name,
      description,
      category,
      links,
      photos: photoArray,
      date,
      venue,
      admin: adminId,
      club: clubId,
    });

  
    await Club.findByIdAndUpdate(clubId, {
      $push: 
      { 
        events: createdEvent._id 
      },
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: createdEvent,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating event",
    });
  }
};



exports.getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("club", "name")
      .populate("admin", "name collegemailid");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    console.error("Get Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching event",
    });
  }
};


exports.updateEvent = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      eventId,
      name,
      description,
      category,
      links,
      date,
      venue,
    } = req.body;
    const photoFiles = req?.files?.photos;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Only the event creator (admin) can update this event",
      });
    }

    let photoArray = [];

    if (photoFiles) {
      if (Array.isArray(photoFiles)) {
        for (let file of photoFiles) {
          const uploaded = await uploadImagetoCloudinary(file, "event_photos");
          photoArray.push(uploaded.secure_url);
        }
      } else {
        const uploaded = await uploadImagetoCloudinary(photoFiles, "event_photos");
        photoArray.push(uploaded.secure_url);
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          name: name || event.name,
          description: description || event.description,
          category: category || event.category,
          links: links || event.links,
          date: date || event.date,
          venue: venue || event.venue,
          photos: [...event.photos, ...photoArray],
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating event",
    });
  }
};
