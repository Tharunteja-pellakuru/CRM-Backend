const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createClient = (req, res) => {
  const {
    organisation_name,
    client_name,
    client_country,
    client_state,
    client_currency,
    client_status,
    lead_id,
  } = req.body;
  if (
    !organisation_name ||
    !client_name ||
    !client_country ||
    !client_state ||
    !client_currency ||
    !client_status ||
    !lead_id
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const uuid = uuidv4();
  const query =
    "INSERT INTO crm_tbl_clients (uuid,organisation_name,client_name,client_country,client_state,client_currency,client_status,lead_id) VALUES (?,?,?,?,?,?,?,?)";
  db.query(
    query,
    [
      uuid,
      organisation_name,
      client_name,
      client_country,
      client_state,
      client_currency,
      client_status,
      lead_id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to create client" });
      }
      
      const clientId = result.insertId;
      db.query(
        "SELECT * FROM crm_tbl_clients WHERE client_id = ?",
        [clientId],
        (err, clients) => {
          if (err) {
            return res.status(201).json({ message: "Client created successfully", uuid });
          }
          res.status(201).json({ message: "Client created successfully", client: clients[0] });
        }
      );
    },
  );
};

const getClients = (req, res) => {
  const query = "SELECT * FROM crm_tbl_clients ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to fetch clients" });
    }
    res.status(200).json(results);
  });
};

module.exports = { createClient, getClients };
