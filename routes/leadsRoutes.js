const express = require("express");
const router = express.Router();

const {
  createLead,
  updateLead,
  getLeads,
  deleteLead
} = require("../controllers/leadsController");

router.post("/add-lead", createLead);
router.put("/update-lead", updateLead);
router.get("/get-leads", getLeads);
router.delete("/delete-lead", deleteLead);

module.exports = router;
