const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { createAdminUser } = require("../controllers/adminUserController");

router.post("/admin-users", upload.single("image"), createAdminUser);

module.exports = router;
