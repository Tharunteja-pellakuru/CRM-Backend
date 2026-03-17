const express = require("express");
const router = express.Router();

const { createClient, getClients } = require("../controllers/clientsController");

router.post("/add-client", createClient);
router.get("/get-clients", getClients);

module.exports = router;
