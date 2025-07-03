const express = require("express");
const router = express.Router();

const {
  createAnnouncement,
  getAnnouncement,
  updateAnnouncement,
} = require("../controllers/announcementController");

const { isAuth, isAdmin } = require("../middlewares/auth");

router.post("/create", isAuth, isAdmin, createAnnouncement);
router.get("/:announcementId", isAuth, getAnnouncement);
router.put("/update", isAuth, isAdmin, updateAnnouncement);

module.exports = router;