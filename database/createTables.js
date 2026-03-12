const db = require("../config/db");

// Admin Users
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(100) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50),
    status BOOLEAN DEFAULT TRUE,
    privileges VARCHAR(255),
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
  `;

  db.query(query, (err) => {
    if (err) {
      console.error("Error creating users table:", err);
    } else {
      console.log("Users table ready");
    }
  });
};

// Leads
const createLeadsTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS leads_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  email VARCHAR(250),
  lead_category ENUM ('Tech', 'Social Media') NOT NULL,
  lead_status VARCHAR(50),
  website_url TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

  db.query(query, (err) => {
    if (err) {
      console.error("Error Creating Leads Table.");
    } else {
      console.log("Leads Table Created");
    }
  });
};

module.exports = { createUsersTable, createLeadsTable };
