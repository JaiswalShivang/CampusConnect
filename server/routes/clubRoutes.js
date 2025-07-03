const express = require("express");
const router = express.Router();

const {
  getAllClub,
  updateClub,
  deleteClub,
  createClub
} = require("../controllers/clubController");

const {
  joinClubRequest,
  approveJoinRequest,
  rejectJoinRequest,
  getPendingRequests,
} = require("../controllers/clubRequestController")

const { isAuth, isAdmin, isStudent } = require("../middlewares/auth");

router.post("/create", isAuth, isAdmin, createClub);
router.get("/all", getAllClub);
router.put("/update", isAuth, isAdmin, updateClub);
router.delete("/delete", isAuth, isAdmin, deleteClub);
router.post("/join", isAuth, isStudent, joinClubRequest);
router.post("/approve", isAuth, isAdmin, approveJoinRequest);
router.post("/reject", isAuth, isAdmin, rejectJoinRequest);
router.get("/pending/:clubId", isAuth, isAdmin, getPendingRequests);

module.exports = router;