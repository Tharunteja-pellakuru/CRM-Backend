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
      (err, result) => {
        if (err) {
          console.error("Error creating lead:", err.message);
          return res.status(500).json({ message: err.message });
        }
        
        // Fetch the created lead to return it
        db.query("SELECT * FROM leads_table WHERE id = ?", [result.insertId], (err, leads) => {
          if (err) {
            return res.status(201).json({ message: "Lead Created Successfully!.", uuid: uuid });
          }
          res.status(201).json({ 
            message: "Lead Created Successfully!.", 
            lead: leads[0] 
          });
        });
      },
    );
  } catch (err) {
    res.status(500).json({ message: "Server Error!." });
  }
};

const updateLead = (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      phone_number,
      email,
      lead_status,
      message,
      lead_category,
      website_url,
    } = req.body;

    const query = `UPDATE leads_table SET 
      full_name = ?, 
      phone_number = ?, 
      email = ?, 
      lead_status = ?, 
      message = ?, 
      lead_category = ?, 
      website_url = ? 
      WHERE id = ? OR uuid = ?;`;

    db.query(
      query,
      [
        full_name,
        phone_number,
        email,
        lead_status,
        message,
        lead_category,
        website_url,
        id,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("Database error updating lead:", err.message);
          return res.status(500).json({ message: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Lead Not Found!." });
        }
        
        // Fetch the updated lead to return it
        db.query("SELECT * FROM leads_table WHERE id = ? OR uuid = ?", [id, id], (err, leads) => {
          if (err) {
             return res.status(200).json({ message: "Lead Updated Successfully!." });
          }
          res.status(200).json({ 
            message: "Lead Updated Successfully!.", 
            lead: leads[0] 
          });
        });
      },
    );
  } catch (err) {
    console.error("Catch block error updating lead:", err.message);
    return res.status(500).json({ message: "Server Error!." });
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

const deleteLead = (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM leads_table WHERE id = ? OR uuid = ?;`;
    db.query(query, [id, id], (err, result) => {
      if (err) {
        console.error("Database error deleting lead:", err.message);
        return res.status(500).json({ message: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lead Not Found!." });
      }
      res.status(200).json({ message: "Lead Deleted Successfully!." });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createLead, updateLead, getLeads, deleteLead };
