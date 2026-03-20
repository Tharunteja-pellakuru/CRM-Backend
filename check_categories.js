const db = require("./config/db");

db.query("SELECT DISTINCT lead_category FROM crm_tbl_leads", (err, result) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Distinct lead_category values:", result);
  
  db.query("SELECT DISTINCT project_category FROM crm_tbl_projects", (err, res2) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("Distinct project_category values:", res2);
    process.exit(0);
  });
});
