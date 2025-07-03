const express = require("express");
const router = express.Router();

const { getProfile, getMyClubs, editUserInfo } = require("../controllers/userController");
const { isAuth, isStudent } = require("../middlewares/auth");

router.get("/profile", isAuth, isStudent, getProfile);
router.get("/myclubs", isAuth, getMyClubs);
router.put("/edit", isAuth, isStudent, editUserInfo);

module.exports = router;