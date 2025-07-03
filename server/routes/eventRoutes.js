const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvent,
  updateEvent,
} = require("../controllers/eventController");

const { isAuth, isAdmin } = require("../middlewares/auth");

router.post("/create", isAuth, isAdmin, createEvent);
router.get("/:eventId", getEvent);
router.put("/update/:eventId", isAuth, isAdmin, updateEvent);

module.exports = router;
