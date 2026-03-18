const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createProject = (req, res) => {
  const {
    project_name,
    project_description,
    project_category,
    project_status,
    project_priority,
    project_budget,
    onboarding_date,
    deadline_date,
    client_id,
  } = req.body;

  const scope_document = req.file ? req.file.filename : req.body.scope_document;

  if (
    !project_name ||
    !project_description ||
    !project_category ||
    !project_status ||
    !project_priority ||
    !project_budget ||
    !onboarding_date ||
    !deadline_date ||
    !client_id
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const uuid = uuidv4();
  const query =
    "INSERT INTO crm_tbl_projects (uuid,project_name,project_description,project_category,project_status,project_priority,project_budget,onboarding_date,deadline_date,scope_document,client_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
  db.query(
    query,
    [
      uuid,
      project_name,
      project_description,
      project_category,
      project_status,
      project_priority,
      project_budget,
      onboarding_date,
      deadline_date,
      scope_document,
      client_id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to create project" });
      }
      
      const projectId = result.insertId;
      db.query(
        "SELECT * FROM crm_tbl_projects WHERE project_id = ?",
        [projectId],
        (err, projects) => {
          if (err) {
            return res.status(201).json({ message: "Project created successfully", uuid });
          }
          res.status(201).json({ message: "Project created successfully", project: projects[0] });
        }
      );
    },
  );
};

const updateProject = (req, res) => {
  const { id } = req.params;
  const {
    project_name,
    project_description,
    project_category,
    project_status,
    project_priority,
    project_budget,
    onboarding_date,
    deadline_date,
  } = req.body;

  const scope_document = req.file ? req.file.filename : req.body.scope_document;

  let query = `UPDATE crm_tbl_projects SET 
    project_name = ?, 
    project_description = ?, 
    project_category = ?, 
    project_status = ?, 
    project_priority = ?, 
    project_budget = ?, 
    onboarding_date = ?, 
    deadline_date = ?`;
  
  const queryParams = [
    project_name,
    project_description,
    project_category,
    project_status,
    project_priority,
    project_budget,
    onboarding_date,
    deadline_date,
  ];

  if (scope_document) {
    query += `, scope_document = ?`;
    queryParams.push(scope_document);
  }

  query += ` WHERE project_id = ?`;
  queryParams.push(id);

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Database error updating project:", err.message);
      return res.status(500).json({ message: "Failed to update project" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project Not Found!" });
    }
    res.status(200).json({ message: "Project Updated Successfully!" });
  });
};

const getProjects = (req, res) => {
  const query = "SELECT * FROM crm_tbl_projects";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching projects:", err.message);
      return res.status(500).json({ message: "Failed to fetch projects" });
    }
    res.status(200).json(result);
  });
};

module.exports = { createProject, getProjects, updateProject };
