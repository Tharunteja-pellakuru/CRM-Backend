const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// Get all admin users except the logged-in user
const getAllAdminUsers = async (req, res) => {
  try {
    const { excludeUuid } = req.query;
    
    let query = `
      SELECT 
        uuid as id, 
        full_name as name, 
        email, 
        role, 
        privileges, 
        status,
        created_at as joinDate,
        image
      FROM admin_users
    `;
    
    const queryParams = [];
    
    if (excludeUuid) {
      query += ` WHERE uuid != ?`;
      queryParams.push(excludeUuid);
    }
    
    query += ` ORDER BY 
      CASE 
        WHEN role = 'Root Admin' THEN 0 
        ELSE 1 
      END, 
      created_at DESC`;

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      // Transform results to include full image URL and format status
      const users = results.map(user => ({
        ...user,
        status: user.status === 1 ? "Active" : "Inactive",
        joinDate: user.joinDate ? user.joinDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        image: user.image ? `http://localhost:5000/uploads/admin/${user.image}` : null,
      }));

      res.json({
        message: "Admin users fetched successfully",
        users: users,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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

    // Convert status to number (FormData sends it as string)
    const statusValue = status === "1" || status === 1 || status === "true" || status === true ? 1 : 0;

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
      [full_name, email, hashedPassword, role, privileges || 'Both', statusValue, image, uuid],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }

        // Construct full image URL
        const imageUrl = req.file 
          ? `http://localhost:5000/uploads/admin/${req.file.filename}`
          : null;

        res.json({
          message: "Admin user updated successfully",
          image: imageUrl,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    // Get user from database
    const query = "SELECT * FROM admin_users WHERE uuid = ? LIMIT 1";
    db.query(query, [uuid], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      const updateQuery = "UPDATE admin_users SET password = ? WHERE uuid = ?";
      db.query(updateQuery, [hashedPassword, uuid], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ message: "Failed to update password" });
        }

        res.json({ message: "Password updated successfully" });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllAdminUsers, createAdminUser, updateAdminUser, updatePassword };
