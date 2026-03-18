const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Create new followup
const createNewFollowup = async (req, res) => {
  const {
    clientId,
    title,
    description,
    followup_date,
    followup_mode,
    followup_status,
    follow_brief,
    priority,
    projectName,
  } = req.body;

  try {
    const uuid = uuidv4();
    const query = `
      INSERT INTO crm_tbl_leadFollowups (
        uuid, followup_title, followup_description, followup_datetime, 
        followup_mode, followup_status, followup_priority, lead_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const capitalize = (s) => {
      if (!s) return s;
      let lower = s.toLowerCase();
      if (lower === "rescheduled") lower = "reschedule";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    };
    const formattedStatus = capitalize(followup_status || "Pending");
    const formattedMode = capitalize(followup_mode || "Call");
    const formattedPriority = capitalize(priority || "Medium");

    db.query(
      query,
      [
        uuid,
        title,
        description,
        followup_date,
        formattedMode,
        formattedStatus,
        formattedPriority,
        clientId,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating followup:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({
          message: "Followup created successfully",
          followup: { id: result.insertId, uuid, ...req.body },
        });
      }
    );
  } catch (error) {
    console.error("Error in createNewFollowup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all followups
const getAllFollowups = async (req, res) => {
  const query = `
    SELECT f.*, s.conclusion_message as follow_brief, s.completed_at, s.completed_by 
    FROM crm_tbl_leadFollowups f
    LEFT JOIN crm_tbl_followUpSummary s ON f.id = s.followup_id
    ORDER BY f.followup_datetime ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching followups:", err);
      return res.status(500).json({ message: "Database error" });
    }
    const transformedResults = results.map(f => ({
      id: f.id,
      uuid: f.uuid,
      clientId: f.lead_id,
      title: f.followup_title,
      description: f.followup_description,
      dueDate: f.followup_datetime,
      followup_mode: f.followup_mode,
      status: f.followup_status.toLowerCase(),
      priority: f.followup_priority,
      follow_brief: f.follow_brief,
      completed_at: f.completed_at,
      completed_by: f.completed_by
    }));
    res.status(200).json(transformedResults);
  });
};

// Update followup
const updateFollowup = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    followup_date,
    followup_mode,
    followup_status,
    priority,
    follow_brief,
    completed_at,
    completed_by,
  } = req.body;

  const query = `
    UPDATE crm_tbl_leadFollowups 
    SET followup_title = ?, followup_description = ?, followup_datetime = ?, 
        followup_mode = ?, followup_status = ?, followup_priority = ?
    WHERE id = ?
  `;

    const capitalize = (s) => {
      if (!s) return s;
      let lower = s.toLowerCase();
      if (lower === "rescheduled") lower = "reschedule";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    };
    const formattedStatus = capitalize(followup_status);
    const formattedMode = capitalize(followup_mode);
    const formattedPriority = capitalize(priority);

    db.query(
      query,
      [
        title,
        description,
        followup_date,
        formattedMode,
        formattedStatus,
        formattedPriority,
        id,
      ],
    (err, result) => {
      if (err) {
        console.error("Error updating followup:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (formattedStatus === "Completed" && follow_brief !== undefined) {
        const summaryUuid = uuidv4();
        const formattedCompletedAt = completed_at
           ? new Date(completed_at).toISOString().slice(0, 19).replace('T', ' ')
           : new Date().toISOString().slice(0, 19).replace('T', ' ');

        const querySummary = `
          INSERT INTO crm_tbl_followUpSummary (uuid, followup_id, conclusion_message, completed_at, completed_by)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE conclusion_message = ?, completed_at = ?, completed_by = ?
        `;
        db.query(
          querySummary,
          [summaryUuid, id, follow_brief, formattedCompletedAt, completed_by || "System", follow_brief, formattedCompletedAt, completed_by || "System"],
          (summaryErr) => {
             if (summaryErr) {
                console.error("Error saving followup summary in edit:", summaryErr);
             }
             res.status(200).json({ message: "Followup updated successfully" });
          }
        );
      } else {
        const deleteSummaryQuery = "DELETE FROM crm_tbl_followUpSummary WHERE followup_id = ?";
        db.query(deleteSummaryQuery, [id], (summaryErr) => {
          if (summaryErr) {
            console.error("Error deleting old followup summary on status change:", summaryErr);
          }
          res.status(200).json({ message: "Followup updated successfully" });
        });
      }
    }
  );
};

const deleteFollowup = async (req, res) => {
  const { id } = req.params;
  
  // First delete associated summary if it exists
  const deleteSummaryQuery = "DELETE FROM crm_tbl_followUpSummary WHERE followup_id = ?";
  db.query(deleteSummaryQuery, [id], (summaryErr) => {
    if (summaryErr) {
      console.error("Error deleting followup summary:", summaryErr);
      return res.status(500).json({ message: "Database error while deleting summary" });
    }

    // Then delete the followup itself
    const query = "DELETE FROM crm_tbl_leadFollowups WHERE id = ?";
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error deleting followup:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "Followup and related summary deleted successfully" });
    });
  });
};

// Toggle status
const toggleFollowupStatus = async (req, res) => {
  const { id } = req.params;
  const { status, brief, completed_at, completed_by } = req.body;

  const capitalize = (s) => {
    if (!s) return s;
    let lower = s.toLowerCase();
    if (lower === "rescheduled") lower = "reschedule";
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };
  const formattedStatus = capitalize(status);

  // Use a transaction or sequential execution
  const queryUpdate = "UPDATE crm_tbl_leadFollowups SET followup_status = ? WHERE id = ?";
  db.query(queryUpdate, [formattedStatus, id], (err, result) => {
    if (err) {
      console.error("Error toggling followup status:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // If status is "Completed", also update/insert into crm_tbl_followUpSummary
    if (formattedStatus === "Completed") {
      const summaryUuid = uuidv4();
      const querySummary = `
        INSERT INTO crm_tbl_followUpSummary (uuid, followup_id, conclusion_message, completed_at, completed_by)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE conclusion_message = ?, completed_at = ?, completed_by = ?
      `;

      db.query(
        querySummary,
        [
          summaryUuid,
          id,
          brief || "",
          completed_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
          completed_by || "System",
          brief || "",
          completed_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
          completed_by || "System",
        ],
        (summaryErr) => {
          if (summaryErr) {
            console.error("Error saving followup summary:", summaryErr);
            // We don't necessarily want to fail the status update if the summary fails, 
            // but we should log it.
          }
          res.status(200).json({ message: "Followup status and summary updated" });
        }
      );
    } else {
      const deleteSummaryQuery = "DELETE FROM crm_tbl_followUpSummary WHERE followup_id = ?";
      db.query(deleteSummaryQuery, [id], (summaryErr) => {
        if (summaryErr) {
          console.error("Error deleting old followup summary on status toggle:", summaryErr);
        }
        res.status(200).json({ message: "Followup status updated" });
      });
    }
  });
};

module.exports = {
  createNewFollowup,
  getAllFollowups,
  updateFollowup,
  deleteFollowup,
  toggleFollowupStatus
};