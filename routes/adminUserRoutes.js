const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  getAllAdminUsers,
  createAdminUser,
  updateAdminUser,
} = require("../controllers/adminUserController");

// Get all admin users (excluding logged-in user via query param)
router.get("/admin-users", getAllAdminUsers);

// Create new admin user
router.post("/admin-users", upload.single("image"), createAdminUser);

// Update admin user
router.post(
  "/admin-users/update/:uuid",
  upload.single("image"),
  updateAdminUser,
);

module.exports = router;
