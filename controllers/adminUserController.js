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

module.exports = { createAdminUser };
