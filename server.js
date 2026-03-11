const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const createUsersTable = require("./database/createTables");
const adminUserRoutes = require("./routes/adminUserRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* Serve uploaded images with absolute path */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  /* Create tables when server starts */
  createUsersTable();
});

/* Routes */
app.use("/api", adminUserRoutes);
app.use("/api", authRoutes);
app.get("/", (req, res) => {
  res.send("CRM Backend Running");
});
