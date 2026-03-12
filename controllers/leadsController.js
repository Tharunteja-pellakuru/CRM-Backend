const db = require("../config/db.js");
const { v4: uuidv4 } = require("uuid");

const createLead = (req, res) => {
  try {
    const uuid = uuidv4();

    const {
      full_name,
      phone_number,
      lead_category,
      lead_status,
      website_url,
      email,
      message,
    } = req.body;

    const query = `INSERT INTO leads_table (uuid, full_name,
      phone_number,
      lead_category,
      lead_status,
      website_url,
      email,     
      message) VALUES (?,?,?,?,?,?,?,?)`;

    db.query(
      query,
      [
        uuid,
        full_name,
        phone_number,
        lead_category,
        lead_status,
        website_url,
        email,
        message,
      ],
      (err) => {
        if (err) {
          console.log(err.message);
          return res.status(500).json({ messge: err.message });
        }
        res
          .status(201)
          .json({ message: "Lead Created Successfully!.", uuid: uuid });
      },
    );
  } catch (err) {
    res.status(500).json({ message: "Server Error!." });
  }
};

const updateLead = (req, res) => {
  try {
    const { id } = req.params; // Get id from route params
    const {
      full_name,
      phone_number,
      lead_category,
      lead_status,
      website_url,
      email,
      message
    } = req.body;

    const updateQuery = `UPDATE leads_table SET full_name = ?, phone_number = ?, email = ?, lead_status = ?, message = ?, lead_category=?, website_url=? WHERE id = ?;`;
    db.query(
      updateQuery,
      [full_name, phone_number, email, lead_status, message, lead_category, website_url, id],
      (err, result) => {
        if (err) {
          console.log("Server Error!.");
          return res.status(500).json({ message: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Lead Not Found!." });
        }
        
        // Fetch the updated lead to return complete data
        const selectQuery = `SELECT * FROM leads_table WHERE id = ?;`;
        db.query(selectQuery, [id], (selectErr, selectResult) => {
          if (selectErr) {
            console.log("Error fetching updated lead:", selectErr.message);
            return res.status(500).json({ message: selectErr.message });
          }
          if (selectResult.length === 0) {
            return res.status(404).json({ message: "Lead not found after update." });
          }
          res.status(200).json({ 
            message: "Lead Updated Successfully!.", 
            lead: selectResult[0] // Return the complete updated lead object
          });
        });
      },
    );
  } catch (err) {
    return res.status(500).json({ messsage: "Server Error!." });
  }
};

const getLeads = (req, res) => {
  try {
    const query = `SELECT * FROM leads_table`;
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res
        .status(200)
        .json({ message: "Leads Fetched Successfully!.", leads: result });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLead = (req, res) => {
  try{
    const {uuid} = req.params
    const query = 'SELECT * FROM leads_table WHERE uuid = ?;';
    db.query(query, [uuid], (err, result) => {
      if (err){
        return res.status(500).json({message:"Failed to fetch the lead"});
      }
      res.status(200).json({message:"Lead Fetched Successfully!.", lead:result[0]})
    })

  }
  catch(err){
    return res.status(500).json({message:"Server Error!."})
  }
}

const deleteLead = (req, res) => {
  try {
    const { id } = req.params; // Get id from route params

    if (!id) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    const query = `DELETE FROM leads_table WHERE id = ?;`;
    db.query(query, [id], (err, result) => {
      if (err) {
        console.log("Server Error.", err.message);
        return res.status(500).json({ message: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lead not found." });
      }
      res.status(200).json({ message: "Lead Deleted Successfully!." });
    });
  } catch (err) {
    console.error("Error deleting lead:", err);
    return res.status(500).json({ message: "Server Error!." });
  }
};

module.exports = { createLead, updateLead, getLeads, deleteLead};
