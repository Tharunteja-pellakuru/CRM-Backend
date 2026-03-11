const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const createAdminUser = async (req, res) => {
  try {
    const { full_name, email, password, role, privileges } = req.body;

    const image = req.file ? req.file.filename : null;

    const userUUID = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO admin_users 
      (uuid, full_name, email, password, role, privileges, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [userUUID, full_name, email, hashedPassword, role, privileges, image],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: err.message });
        }

        res.status(201).json({
          message: "Admin user created successfully",
          uuid: userUUID,
          image: image,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateAdminUser = async (req, res) => {
  try {
    const { uuid } = req.params;

    const { full_name, email, password, role, privileges, status } = req.body;

    const image = req.file ? req.file.filename : null;

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `
      UPDATE admin_users
      SET 
        full_name = ?,
        email = ?,
        password = COALESCE(?, password),
        role = ?,
        privileges = ?,
        status = ?,
        image = COALESCE(?, image)
      WHERE uuid = ?
    `;

    db.query(
      query,
      [full_name, email, hashedPassword, role, privileges, status, image, uuid],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }

        res.json({
          message: "Admin user updated successfully",
        });
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createAdminUser, updateAdminUser };
