const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  getAllAdminUsers,
  createAdminUser,
  updateAdminUser,
  updatePassword,
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

// Update password
router.post("/admin-users/update-password/:uuid", updatePassword);

module.exports = router;
