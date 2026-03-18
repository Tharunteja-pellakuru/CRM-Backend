const db = require("./config/db.js");

const checkLeads = () => {
  db.query("SELECT * FROM crm_tbl_leads", (err, result) => {
    if (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
    console.log("Total leads:", result.length);
    result.forEach(l => {
      console.log(`ID: ${l.id}, Name: ${l.full_name}, Status: ${l.lead_status}, Category: ${l.lead_category}`);
    });
    process.exit(0);
  });
};

checkLeads();
