const db = require("../config/db");
const bcrypt = require("bcrypt");

const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const query = "SELECT * FROM admin_users WHERE email = ? LIMIT 1";

  db.query(query, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        uuid: user.uuid,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        privileges: user.privileges,
        image: user.image,
      },
    });
  });
};

module.exports = { loginAdmin };
