const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createAdminUser,
  updateAdminUser,
} = require("../controllers/adminUserController");

router.post("/admin-users", upload.single("image"), createAdminUser);
router.post(
  "/admin-users/update/:uuid",
  upload.single("image"),
  updateAdminUser,
);

module.exports = router;
