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

const createNewFollowupsTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS lead_followups  (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(100) UNIQUE,
    followup_title VARCHAR(100) NOT NULL,
    followup_description TEXT,
    followup_datetime DATETIME NOT NULL,

    followup_mode ENUM('Call','Email','Whatsapp','Meeting') NOT NULL,

    followup_status ENUM('Pending','Completed','Reschedule','Cancelled') NOT NULL DEFAULT 'Pending',

    followup_priority ENUM('High','Medium','Low') NOT NULL DEFAULT 'Medium',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    lead_id INT NOT NULL,
    INDEX (lead_id),

    FOREIGN KEY (lead_id) REFERENCES leads_table(id) ON DELETE CASCADE
);`;
  db.query(query, (err) => {
    if (err) {
      console.log("Error Creating Follows Table.");
    } else {
      console.log("Follows Table Created");
    }
  });
};

const createFollowupSummaryTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS followup_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(250) UNIQUE NOT NULL,
    followup_id INT NOT NULL,
    conclusion_message TEXT NOT NULL,
    completed_at DATETIME NOT NULL,
    completed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_followup_conclusion
        FOREIGN KEY (followup_id)
        REFERENCES lead_followups(id)
        ON DELETE CASCADE
);`;

  db.query(query, (err) => {
    if (err) {
      console.error("Error Creating Followup Summary Table.");
    } else {
      console.log("Followup Summary Table Created");
    }
  });
};

module.exports = {
  createUsersTable,
  createLeadsTable,
  createNewFollowupsTable,
  createFollowupSummaryTable,
};
