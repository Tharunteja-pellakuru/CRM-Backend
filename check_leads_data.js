const db = require("./config/db.js");

const checkLeads = () => {
  db.query("SELECT id, full_name, phone_number, country, lead_status FROM crm_tbl_leads", (err, result) => {
    if (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
    console.log("Leads data:");
    result.forEach(l => {
      console.log(`ID: ${l.id}, Name: ${l.full_name}, Phone: [${l.phone_number}], Country: [${l.country}], Status: ${l.lead_status}`);
    });
    process.exit(0);
  });
};

checkLeads();
